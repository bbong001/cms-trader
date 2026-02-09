-- Tạo bảng điều khiển kết quả theo phiên cho ContractPosition
-- Chạy file này trực tiếp trên database Postgres đang dùng cho CMS (schema public).

CREATE TABLE IF NOT EXISTS "contract_session_controls" (
  "id" SERIAL PRIMARY KEY,
  "final" TEXT NOT NULL,           -- 'WIN' hoặc 'LOSS'
  "required" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Kiểm tra nhanh dữ liệu:
-- SELECT * FROM "contract_session_controls" ORDER BY "created_at" DESC;

