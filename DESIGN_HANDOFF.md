# Career Nova — Design Handoff & Style Guide

> Tài liệu chuẩn hóa UX/UI để mọi màn hình mới **nhất quán, dễ dùng, và truyền đạt đúng giá trị** (phân tích kỹ năng & việc làm IT cho sinh viên). Áp dụng 3 lăng kính: **màu sắc · UX copy · component/handoff**.

---

## 1. Tagline & thông điệp sản phẩm

| Vị trí        | Nội dung                                            | Vì sao                                             |
| ------------- | --------------------------------------------------- | -------------------------------------------------- |
| Sidebar brand | **Career Nova** — _Phân tích kỹ năng & việc làm IT_ | Mỗi màn hình đều nhắc "web này làm gì"             |
| Landing hero  | _Biết mình còn thiếu kỹ năng gì so với thị trường_  | Nói **kết quả** cho sinh viên, không nói tính năng |

**Voice:** thân thiện, ngôi "bạn", động từ hành động ("Đối soát CV", "Xem khoảng trống"), tránh từ sáo rỗng ("tiềm năng tốt") và nhãn gây hiểu nhầm AI khi chỉ là template.

---

## 2. Color system (semantic — bám đúng ý nghĩa)

Dùng Tailwind utilities, **theo nghĩa cố định** (không đổi màu tùy hứng):

| Vai trò ngữ nghĩa                 | Màu                                               | Dùng cho                                             |
| --------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Primary / "Bạn" / hành động       | `blue-600` (hover `blue-700`), nền nhạt `blue-50` | CTA chính, đường "Bạn" trên chart, link              |
| Đạt / mạnh / "Yêu cầu thị trường" | `emerald-500`, nền `emerald-50/100`               | Kỹ năng mạnh, trạng thái hoàn thành, đường "Yêu cầu" |
| Một phần / cảnh báo               | `amber-500/600`, nền `amber-50/100`               | Tương thích một phần, "chưa có CV"                   |
| Thiếu / lỗi                       | `red-500/600`, nền `red-50/100`                   | Kỹ năng thiếu, lỗi form                              |
| Ngữ nghĩa / liên quan (AI match)  | `violet-500/600`, nền `violet-50`                 | Badge "liên quan tới X", lộ trình nghề               |
| Trung tính                        | `slate-*`                                         | Văn bản, viền, nền phụ                               |

Token nền tảng ở `globals.css` (`--primary #030213`, `--destructive #d4183d`, `--radius 0.625rem`). Bo góc chuẩn: `rounded-xl`/`rounded-2xl` cho card.

---

## 3. Bộ từ điển thuật ngữ (UX copy chuẩn)

Nguồn duy nhất: `InfoTooltip.tsx → GLOSSARY`. Dùng đúng từ, không lẫn:

| Thuật ngữ           | Nghĩa                                       | KHÔNG dùng lẫn                         |
| ------------------- | ------------------------------------------- | -------------------------------------- |
| **Điểm phù hợp**    | Điểm tổng, đã tính trọng số                 | ~~tổng thể phù hợp~~                   |
| **Độ tương đồng**   | Mức gần nhau ngữ nghĩa từng kỹ năng         | ~~cấp độ của bạn~~                     |
| **Trọng số**        | Bắt buộc / Ưa thích (tầm quan trọng)        | —                                      |
| **Khoảng trống**    | Kỹ năng thị trường cần mà CV thiếu          | —                                      |
| **liên quan tới X** | matched_via (chỉ hiện khi tương đồng ≥ 60%) | ~~khớp qua~~ (gây hiểu là tương đương) |

**Nguyên tắc:** chỉ hiển thị số liệu **có thật từ thuật toán** (similarity, weight, contribution). Không bịa cấp độ/năm kinh nghiệm.

---

## 4. Component dùng chung (đã tách — KHÔNG vẽ lại)

| Component                  | File                 | Dùng khi                                                                                                                                                                       |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SkillRadar`               | `SkillRadar.tsx`     | Mọi radar "bạn vs thị trường". Tự đổi sang **bar ngang khi <3 kỹ năng**. Props: `requiredLabel`, `matchedViaLabel`, `matchedViaMinSimilarity`, `clickableLabels`, `scrollable` |
| `EmptyState`               | `EmptyState.tsx`     | Mọi trạng thái rỗng. `icon + title + description + CTA`                                                                                                                        |
| `InfoTooltip` + `GLOSSARY` | `InfoTooltip.tsx`    | Giải thích metric (icon ?)                                                                                                                                                     |
| `NextStepBanner`           | `NextStepBanner.tsx` | CTA "bước tiếp theo" nối các trang                                                                                                                                             |

---

## 5. States bắt buộc cho mỗi màn

| State       | Chuẩn                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| **Loading** | Danh sách/thẻ → **skeleton** xám nhấp nháy (`animate-pulse`); nút → spinner `Loader2` |
| **Empty**   | Dùng `EmptyState` (icon + mô tả + 1 CTA hành động, vd "Đối soát CV")                  |
| **Error**   | Banner đỏ `red-50/200` + icon `AlertCircle` + thông điệp cụ thể tiếng Việt            |
| **Success** | Banner `emerald-50/200` + `Check`                                                     |
| **No-CV**   | Mọi tính năng cá nhân hóa → CTA rõ "Tải CV để mở khóa"                                |

---

## 6. Information Architecture / điều hướng

- **Sidebar theo hành trình, đánh số:** `1 · Hồ sơ` → `2 · Phân tích` → `3 · Hành động` → `Khám phá thị trường`.
- **Thanh hành trình:** ở header (xuyên trang: "đang ở đây / tiếp theo"), **tự ẩn trên Tổng quan Cá nhân** (nơi đã có thanh chi tiết) → không trùng.
- **Ranh giới vai trò (chống "5 trang giống nhau"):**
  - **Skill Gap** = chẩn đoán (gap + radar)
  - **Roadmap** = học (khóa học/lộ trình)
  - **CV Matching** = đối soát CV ↔ vai trò
  - **Đề xuất** = **hub**: tóm tắt + link sang 3 trang trên
  - **Tổng quan Cá nhân** = trung tâm cá nhân
- **Onboarding → `/my-dashboard`** (trang cá nhân), không phải market.

---

## 7. Responsive (định hướng)

| Breakpoint      | Hành vi                                                      |
| --------------- | ------------------------------------------------------------ |
| Desktop >1024px | Layout đầy đủ, sidebar mở                                    |
| Tablet 768–1024 | Grid 3→2 cột, sidebar thu gọn được                           |
| Mobile <768     | Card xếp dọc; chart/radar + bảng cuộn ngang; sidebar overlay |

---

## 8. Việc nên làm tiếp (ưu tiên cho trải nghiệm mới-vào)

1. **Progressive disclosure cho mọi trang phụ thuộc CV** (đã làm ở Personal Dashboard) — áp tương tự nếu thêm trang mới.
2. **Mobile pass**: kiểm radar/bảng cuộn, kích thước chạm ≥44px, tương phản chữ phụ.
3. **A11y**: `aria-label` cho nút icon, focus ring rõ, thứ tự tab hợp lý.

---

_Tài liệu này phản ánh trạng thái sau đợt chuẩn hóa: `SkillRadar`/`EmptyState`/`InfoTooltip` dùng chung, màu semantic nhất quán, copy bám dữ liệu thật._
