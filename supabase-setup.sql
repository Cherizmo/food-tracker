-- ═══════════════════════════════════════════
-- 保质期管家 — Supabase 数据库初始化
-- 在 Supabase SQL Editor 中运行此文件
-- ═══════════════════════════════════════════

-- 1. 创建菜品表
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  production_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  shelf_life_days INTEGER NOT NULL,
  shelf_life_unit TEXT DEFAULT 'day',
  created_at BIGINT NOT NULL DEFAULT 0
);

-- 2. 启用 Row Level Security
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- 3. 安全策略：用户只能访问自己的数据
CREATE POLICY "Users manage own items"
  ON food_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. 索引：加速用户查询
CREATE INDEX IF NOT EXISTS idx_food_items_user ON food_items(user_id);
CREATE INDEX IF NOT EXISTS idx_food_items_expiry ON food_items(user_id, expiry_date);
