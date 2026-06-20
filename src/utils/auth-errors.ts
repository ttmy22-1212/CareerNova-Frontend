// Chuyển lỗi xác thực (mã backend / Error / string) thành thông điệp
// tiếng Việt cụ thể, dễ hiểu cho người dùng.
//
// Backend trả về MÃ lỗi (vd "AUTH_EMAIL_EXISTS") chứ không phải câu tiếng
// Việt; lớp api-request lại bọc thành chuỗi "Lỗi: <mã>" và đôi khi ném ra
// dưới dạng string (không phải Error) — nên trước đây UI luôn rơi vào câu
// fallback chung chung ("Đăng nhập/Đăng ký thất bại"). Hàm này gỡ rối:
// trích mã AUTH_* (nếu có) và ánh xạ sang câu rõ ràng.

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AUTH_EMAIL_EXISTS:
    "Email này đã được đăng ký. Bạn hãy đăng nhập hoặc dùng email khác.",
  AUTH_ACCOUNT_NOT_ACTIVE:
    "Email chưa được xác thực. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản trước khi đăng nhập.",
  AUTH_ACCOUNT_NOT_FOUND: "Không tìm thấy tài khoản với email này.",
  AUTH_INVALID_CREDENTIALS: "Email hoặc mật khẩu không đúng.",
  AUTH_INVALID_VERIFY_TOKEN: "Liên kết xác thực không hợp lệ.",
  AUTH_VERIFY_TOKEN_EXPIRED:
    "Liên kết xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email.",
  AUTH_INVALID_RESET_TOKEN:
    "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  AUTH_INVALID_REFRESH_TOKEN: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  AUTH_TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  AUTH_REGISTER_FAILED: "Đăng ký thất bại. Vui lòng thử lại.",
  AUTH_GOOGLE_LOGIN_FAILED: "Đăng nhập bằng Google thất bại. Vui lòng thử lại.",
  AUTH_GOOGLE_INVALID_TOKEN: "Phiên đăng nhập Google không hợp lệ.",
  AUTH_GOOGLE_NO_ID_TOKEN: "Không nhận được thông tin từ Google.",
  AUTH_FACEBOOK_LOGIN_FAILED:
    "Đăng nhập bằng Facebook thất bại. Vui lòng thử lại.",
};

/**
 * @param raw     giá trị bắt được trong catch (Error | string | unknown)
 * @param fallback câu mặc định khi không nhận diện được lỗi
 */
export function mapAuthError(raw: unknown, fallback: string): string {
  const text =
    raw instanceof Error ? raw.message : typeof raw === "string" ? raw : "";
  if (!text) return fallback;

  // Trích mã AUTH_* nếu có (chuỗi thường dạng "Lỗi: AUTH_EMAIL_EXISTS")
  const code = text.match(/AUTH_[A-Z_]+/)?.[0];
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];

  // Không phải mã đã biết: trả message đã làm sạch (bỏ tiền tố "Lỗi: ")
  const cleaned = text.replace(/^Lỗi:\s*/i, "").trim();
  // Nếu vẫn là một mã kỹ thuật khó hiểu thì dùng fallback
  if (!cleaned || /^[A-Z0-9_]+$/.test(cleaned)) return fallback;
  return cleaned;
}
