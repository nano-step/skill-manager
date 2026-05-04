# RRI-T Vietnamese Testing — 13 Test Cases

Kiểm thử đặc thù tiếng Việt — từ PDF section 9.

## Bảng Test Cases

| # | Area | Test Case | Expected | Priority |
|---|------|-----------|----------|----------|
| 1 | Dấu tiếng Việt | Search "nguyen" → tìm "Nguyễn" | Diacritic-insensitive match | P0 |
| 2 | Unicode sorting | Đ sort sau D | TV alphabet order (Đ > D) | P1 |
| 3 | VND Currency | 1234567 → hiển thị | "1.234.567 ₫" (dấu chấm nghìn) | P0 |
| 4 | Phone format | Nhập "+84 912 345 678" và "0912345678" | Accept cả hai, normalize về chuẩn | P0 |
| 5 | Date format | Ngày hiển thị | DD/MM/YYYY (không phải MM/DD/YYYY) | P0 |
| 6 | Timezone | Server UTC, client display | GMT+7 đúng, không lệch giờ | P0 |
| 7 | Địa chỉ VN | Nhập địa chỉ Việt Nam | Cấu trúc: Số nhà / Đường / Phường / Quận / TP | P1 |
| 8 | CCCD/CMND | CCCD 12 số, CMND 9 số | Chấp nhận cả hai định dạng, validate độ dài | P0 |
| 9 | Mã số thuế | MST 10 hoặc 13 chữ số | Validate format, reject sai số chữ số | P1 |
| 10 | Text overflow | VN text ~30% dài hơn EN | UI không vỡ layout ở mọi screen size | P1 |
| 11 | Font rendering | Diacritic ở font size nhỏ | Hiển thị rõ dấu ở 10px | P1 |
| 12 | Input methods | Telex / VNI / VIQR | Cả 3 phương thức gõ hoạt động đúng | P1 |
| 13 | PDF export | Export PDF với nội dung tiếng Việt | Dấu tiếng Việt đúng trong PDF xuất ra | P0 |

## Quick Checklist

- [ ] 1. Dấu tiếng Việt — search diacritic-insensitive
- [ ] 2. Unicode sorting — Đ sau D theo alphabet TV
- [ ] 3. VND — dấu chấm nghìn, ký hiệu ₫
- [ ] 4. Số điện thoại — accept +84 và 0xxx, normalize
- [ ] 5. Date format — DD/MM/YYYY
- [ ] 6. Timezone — hiển thị GMT+7
- [ ] 7. Địa chỉ VN — structure đúng theo chuẩn VN
- [ ] 8. CCCD/CMND — accept 12 và 9 số
- [ ] 9. Mã số thuế — 10 hoặc 13 số
- [ ] 10. Text overflow — layout không vỡ
- [ ] 11. Font rendering — dấu rõ ở 10px
- [ ] 12. Input methods — Telex/VNI/VIQR
- [ ] 13. PDF export — dấu đúng trong file xuất
