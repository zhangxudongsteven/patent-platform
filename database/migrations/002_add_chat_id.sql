-- 添加 chat_id 字段到 history_data 表
ALTER TABLE history_data ADD COLUMN IF NOT EXISTS chat_id VARCHAR(255) UNIQUE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_history_data_chat_id ON history_data(chat_id);
