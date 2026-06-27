// Chuẩn hóa keyword (search_group, nhóm nghề, danh mục, ngành...) lấy từ backend:
// đổi snake_case "_" thành dấu cách, rồi viết hoa chữ cái đầu mỗi từ NẾU CHƯA,
// giữ nguyên phần còn lại của từ.
//
// Cố ý KHÔNG lowercase toàn bộ trước khi viết hoa — để không phá các acronym
// / cách viết hoa sẵn có (vd "AI/ML", "DevOps", "QA", "JavaScript" giữ nguyên).
// "software engineer" → "Software Engineer"; "consumer_goods" → "Consumer Goods".
// Chỉ dùng ở TẦNG HIỂN THỊ — không đụng key/onClick/API (giá trị gốc giữ nguyên).
export const toTitleCase = (value?: string | null): string =>
  (value || "")
    .replace(/_/g, " ")
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
