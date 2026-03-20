-- 创建历史记录表
CREATE TABLE IF NOT EXISTS history_data (
  id SERIAL PRIMARY KEY,
  operation_title VARCHAR(255) NOT NULL,
  operation_type VARCHAR(50) NOT NULL,
  operation_content TEXT,
  operation_result TEXT,
  folder_id VARCHAR(50) DEFAULT 'general',
  workflow_step INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_history_data_folder_id ON history_data(folder_id);
CREATE INDEX IF NOT EXISTS idx_history_data_created_at ON history_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_data_operation_type ON history_data(operation_type);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_history_data_updated_at
  BEFORE UPDATE ON history_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
