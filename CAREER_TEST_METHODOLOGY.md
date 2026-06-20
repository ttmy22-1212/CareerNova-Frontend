# Cơ sở khoa học & cách kiểm chứng — Bài kiểm tra hướng nghiệp (RIASEC)

> Tài liệu giải thích **đề xuất nghề dựa trên nguồn nào**, **ánh xạ ra sao**, và **cách kiểm chứng tính đúng** — dùng cho team test, đánh giá và phụ lục khóa luận.

---

## 1. Khung lý thuyết (nguồn gốc đề xuất)

Bài test **KHÔNG tự bịa** kết quả. Nó dựa trên 2 nguồn đã được kiểm chứng & công khai:

1. **Holland Codes / RIASEC** — *Theory of Vocational Choice* (John L. Holland, 1959/1997).
   - Phân loại sở thích nghề thành 6 nhóm: **R**ealistic, **I**nvestigative, **A**rtistic, **S**ocial, **E**nterprising, **C**onventional.
   - Là mô hình hướng nghiệp được nghiên cứu & trích dẫn nhiều nhất, độ tin cậy (reliability) và hiệu lực (validity) đã được kiểm định trong hàng trăm nghiên cứu.

2. **O*NET Interest Profiler** — *U.S. Department of Labor / O*NET program*.
   - Bộ công cụ **miễn phí, công khai (public domain)**, đã chuẩn hóa tâm trắc, dùng chính khung RIASEC.
   - Mỗi nghề trong cơ sở dữ liệu O*NET được gán **mã sở thích (Interest code)** theo RIASEC → đây là căn cứ để ánh xạ "nhóm sở thích → nghề".

**Câu hỏi trong app** được soạn theo phong cách O*NET ("Bạn thích làm hoạt động này tới mức nào?", thang Likert 5 mức) — đo *sở thích hoạt động*, không hỏi kiến thức.

---

## 2. Cách chấm điểm (minh bạch, tái lập được)

- 18 câu = 3 câu/nhóm RIASEC. Mỗi câu Likert 1–5.
- Điểm mỗi nhóm = tổng 3 câu (0–15) → quy ra %.
- Lấy **3 nhóm điểm cao nhất** → mã RIASEC (vd "I-A-C").
- Không có yếu tố ngẫu nhiên → cùng câu trả lời luôn ra cùng kết quả (kiểm thử lặp lại được).

---

## 3. Ánh xạ RIASEC → nghề IT (căn cứ mã O*NET)

App **so khớp hồ sơ RIASEC của user với hồ sơ RIASEC của từng nghề** (đúng cách O*NET match người↔nghề). Mỗi nghề có hồ sơ trong code (`ROLE_RIASEC_PROFILE`) **bám theo mã sở thích O*NET của các nghề IT thực tế**; điểm khớp = tổng (sở thích user × trọng số nhóm trong hồ sơ nghề), lấy top 3:

| Nhóm RIASEC | Nghề IT (trong app) | Căn cứ — nghề O*NET có mã sở thích tương ứng (mã SOC) |
|---|---|---|
| **I** Investigative | AI/ML, Data, Backend, Security | Software Developers `15-1252` (I,C,R); Data Scientists `15-2051` (I,C,R); Information Security Analysts `15-1212` (I,C,R) |
| **A** Artistic | Frontend, Mobile | Web & Digital Interface Designers `15-1255` (A,I,R); Web Developers `15-1254` |
| **R** Realistic | DevOps, (Backend) | Network Architects `15-1241` / Network Admins `15-1244` (R,I,C) |
| **C** Conventional | QA, Data Analyst, Security | QA Analysts & Testers `15-1253` (C,I); Database Administrators `15-1242` (C,I) |
| **E** Enterprising | Fullstack (hướng lead/sản phẩm) | Computer & Information Systems Managers `11-3021` (E,I,C) |
| **S** Social | hỗ trợ/cộng tác (Frontend, QA) | Computer User Support Specialists `15-1232` (S,R,C) |

> Diễn giải: hầu hết nghề IT thuộc cụm **I–C–R** (phân tích · quy chuẩn · thực hành); thiết kế/giao diện nghiêng **A**; quản lý/sản phẩm nghiêng **E**; hỗ trợ người dùng nghiêng **S**. Ánh xạ của app phản ánh đúng phân bố này.

**Cách kiểm tra ánh xạ:** tra cứu trực tiếp tại **onetonline.org** → mở 1 nghề (vd "Software Developers") → mục **Interests** sẽ thấy mã RIASEC (Occupational Interest Profile) trùng với bảng trên.

---

## 4. "Làm sao biết đề xuất đúng?" — 3 lớp kiểm chứng

| Lớp | Câu hỏi | Cách kiểm |
|---|---|---|
| **1. Hiệu lực khung lý thuyết** | RIASEC có đáng tin? | Đã được kiểm định khoa học rộng rãi (Holland, O*NET) — trích nguồn ở §1. |
| **2. Hiệu lực ánh xạ** | Nhóm RIASEC → nghề IT có đúng? | Đối chiếu mã sở thích O*NET từng nghề (§3) — **truy được, không phải ý kiến chủ quan**. |
| **3. Hiệu lực thực nghiệm (face validity)** | Người dùng thấy kết quả **đúng với bản thân** không? | Khảo sát user test — xem §5. |

---

## 5. Đo "độ đúng" khi user test (bổ sung vào khảo sát)

Thêm các câu sau (thang 1–5) vào buổi user test để định lượng face/predictive validity:

- "Kết quả nhóm sở thích (RIASEC) **mô tả đúng con người tôi**." *(1–5)*
- "Các nghề IT được gợi ý **phù hợp với sở thích/định hướng** của tôi." *(1–5)*
- "Tôi thấy lời giải thích **vì sao hợp nghề đó** thuyết phục." *(1–5)*
- *(Đối chứng)* "Bạn tự thấy mình hợp nghề nào nhất?" → so với top gợi ý của app (tính tỉ lệ trùng).

**Tiêu chí đạt (đề xuất):** điểm trung bình ≥ 4.0/5 và tỉ lệ trùng "tự nhận vs app gợi ý" ≥ 60% (top-3).

---

## 6. Giới hạn (nêu rõ để trung thực)

- Bản rút gọn **18 câu** (3/nhóm) → nhanh nhưng độ phân giải thấp hơn bản O*NET đầy đủ (60 câu). Có thể nâng lên 30/60 câu nếu cần độ chính xác cao hơn.
- Đo **sở thích**, không đo **năng lực** — vì vậy app kết hợp thêm **đối soát CV** (năng lực thật) để bù.
- Ánh xạ RIASEC→nghề là **heuristic theo mã O*NET**, không thay thế tư vấn hướng nghiệp chuyên sâu.

---

## 7. Nguồn tham khảo

- Holland, J. L. (1997). *Making Vocational Choices: A Theory of Vocational Personalities and Work Environments* (3rd ed.). PAR.
- O*NET Interest Profiler & Occupational Interest profiles — **onetonline.org** / **onetcenter.org** (U.S. Department of Labor, Employment & Training Administration). Public domain.
- O*NET-SOC codes nghề IT: 15-1252 (Software Developers), 15-1254 (Web Developers), 15-1255 (Web & Digital Interface Designers), 15-2051 (Data Scientists), 15-1212 (Information Security Analysts), 15-1242 (Database Administrators), 15-1253 (QA Analysts & Testers), 15-1241/15-1244 (Network Architects/Admins), 11-3021 (CIS Managers), 15-1232 (Computer User Support Specialists).

> Lưu ý: mã SOC/interest code nên đối chiếu lại bản O*NET mới nhất tại onetonline.org khi đưa vào báo cáo (phiên bản O*NET cập nhật định kỳ).
