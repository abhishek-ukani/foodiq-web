-- Migration: Add scope flags to daily_menu_items to separate Direct Selling vs Thali Options
ALTER TABLE daily_menu_items 
ADD COLUMN IF NOT EXISTS is_standalone_sale BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_thali_option BOOLEAN DEFAULT true;

COMMENT ON COLUMN daily_menu_items.is_standalone_sale IS 'If true, item appears on the website main menu for direct purchase.';
COMMENT ON COLUMN daily_menu_items.is_thali_option IS 'If true, item is available inside dynamic Thali option groups for today.';
