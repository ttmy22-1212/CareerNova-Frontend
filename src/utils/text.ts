// Chuẩn hóa keyword (search_group, nhóm nghề, danh mục...) lấy từ backend:
// viết hoa chữ cái đầu mỗi từ NẾU CHƯA, giữ nguyên phần còn lại của từ.
//
// Cố ý KHÔNG lowercase toàn bộ trước khi viết hoa — để không phá các acronym
// / cách viết hoa sẵn có (vd "AI/ML", "DevOps", "QA", "JavaScript" giữ nguyên).
// Chỉ "software engineer" → "Software Engineer".
export const toTitleCase = (value?: string | null): string =>
  (value || "")
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
