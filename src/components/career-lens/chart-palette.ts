// ============================================================
// Bảng màu dùng chung cho biểu đồ & dashboard (Career Nova)
// ------------------------------------------------------------
// Nguyên tắc của chuyên gia màu: TÁCH BẠCH 2 vai trò màu, không
// được trộn lẫn — đây chính là chỗ gây "rối loạn" trước đây:
//
//  1) MÀU NGỮ NGHĨA (SEMANTIC) — mang Ý NGHĨA cố định, chỉ dùng
//     để báo trạng thái. KHÔNG bao giờ dùng làm màu trang trí
//     hay tô danh mục.
//        success (emerald) = đạt / mạnh
//        warning (amber)   = một phần / chú ý
//        danger  (red)     = thiếu / lỗi
//        primary (blue)    = "Bạn" / hành động chính
//        semantic(violet)  = khớp ngữ nghĩa (AI) / lộ trình nghề
//
//  2) MÀU PHÂN LOẠI (CATEGORY) — chỉ để PHÂN BIỆT các nhóm trung
//     tính (nhóm kỹ năng, ngành...). Dùng dải JEWEL-TONE trải rộng
//     xanh dương → lam → chàm → tím → hồng/magenta, XEN KẼ hue + độ
//     sáng để 2 ô cạnh nhau LUÔN dễ phân biệt. CỐ Ý KHÔNG chứa xanh
//     lá / vàng / đỏ / cam (trùng nghĩa success/warning/danger).
//     (Trước đây chỉ dùng dải lạnh xanh→tím nên các ô quá giống nhau —
//      cô hướng dẫn phản hồi khó phân biệt, nên đã mở rộng dải màu.)
//
// Quy tắc cuối: nếu độ dài thanh/diện tích đã mã hoá giá trị thì
// KHÔNG tô thêm nhiều màu — dùng 1 màu thương hiệu, để hình dạng
// truyền tải thông tin (giảm nhiễu thị giác).
// ============================================================

// Màu ngữ nghĩa (đồng bộ DESIGN_HANDOFF.md)
export const SEMANTIC = {
  primary: "#2563eb", // blue-600  — "Bạn" / hành động
  success: "#10b981", // emerald-500 — đạt / mạnh
  warning: "#f59e0b", // amber-500 — một phần
  danger: "#ef4444", // red-500 — thiếu / lỗi
  semantic: "#7c3aed", // violet-600 — khớp ngữ nghĩa / nghề
  neutral: "#94a3b8", // slate-400 — trung tính
} as const;

// Một màu thương hiệu duy nhất cho dữ liệu ĐÃ XẾP HẠNG bằng độ dài
// (vd: Top kỹ năng) — màu không thêm thông tin nên giữ nhất quán.
export const BRAND_BAR = SEMANTIC.primary;

// Dải màu phân loại jewel-tone, medium-dark (chữ trắng đọc được), XEN KẼ hue
// để các ô cạnh nhau tương phản rõ; không trùng hue success/warning/danger.
export const CATEGORY_COLORS = [
  "#2563eb", // blue-600
  "#db2777", // pink-600
  "#0e7490", // cyan-700
  "#7c3aed", // violet-600
  "#c026d3", // fuchsia-600
  "#0284c7", // sky-700
  "#9333ea", // purple-600
  "#be185d", // pink-700
  "#4f46e5", // indigo-600
  "#a21caf", // fuchsia-700
  "#1d4ed8", // blue-700
  "#6366f1", // indigo-500
];

export const categoryColor = (index: number) =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length];
