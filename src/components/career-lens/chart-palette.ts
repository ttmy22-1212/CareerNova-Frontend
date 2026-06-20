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
//     tính (nhóm kỹ năng, ngành...). Dùng một dải lạnh hài hoà
//     (xanh dương → chàm → tím), CỐ Ý KHÔNG chứa xanh lá / vàng /
//     đỏ / cam để không bị đọc nhầm thành trạng thái tốt/xấu.
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

// Dải màu phân loại lạnh, hài hoà, medium-dark (chữ trắng đọc được),
// không trùng hue ngữ nghĩa success/warning/danger.
export const CATEGORY_COLORS = [
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#0284c7", // sky-700
  "#4f46e5", // indigo-600
  "#9333ea", // purple-600
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
];

export const categoryColor = (index: number) =>
  CATEGORY_COLORS[index % CATEGORY_COLORS.length];
