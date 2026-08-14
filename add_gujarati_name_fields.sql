-- ====================================================================
-- Add Gujarati Name Fields to Categories & Food Items
-- ====================================================================

-- 1. Add name_gujarati to categories
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS name_gujarati TEXT NULL;

-- 2. Add name_gujarati to food_items
ALTER TABLE public.food_items
ADD COLUMN IF NOT EXISTS name_gujarati TEXT NULL;

-- 3. Add sample Gujarati names for existing default items (Optional seed)
UPDATE public.categories SET name_gujarati = 'થાળી' WHERE slug = 'thalis';
UPDATE public.categories SET name_gujarati = 'શાક / મેઇન કોર્સ' WHERE slug = 'sabji';
UPDATE public.categories SET name_gujarati = 'રોટલી / ભાખરી' WHERE slug = 'breads';
UPDATE public.categories SET name_gujarati = 'મિઠાઈ' WHERE slug = 'sweets';
UPDATE public.categories SET name_gujarati = 'ફરસાણ / સ્નેક્સ' WHERE slug = 'add-ons' OR slug = 'snacks';

UPDATE public.food_items SET name_gujarati = 'રેગ્યુલર થાળી' WHERE slug = 'regular-thali';
UPDATE public.food_items SET name_gujarati = 'ક્લાસિક થાળી' WHERE slug = 'classic-thali';
UPDATE public.food_items SET name_gujarati = 'પ્રીમિયમ થાળી' WHERE slug = 'premium-thali';
UPDATE public.food_items SET name_gujarati = 'ડીલક્સ થાળી' WHERE slug = 'deluxe-thali';
UPDATE public.food_items SET name_gujarati = 'એક્સ્ટ્રા રોટલી (૧ નંગ)' WHERE slug = 'extra-roti';
UPDATE public.food_items SET name_gujarati = 'એક્સ્ટ્રા ભાખરી (૧ નંગ)' WHERE slug = 'extra-bhakhri';
UPDATE public.food_items SET name_gujarati = 'છાશ' WHERE slug = 'chhash';
UPDATE public.food_items SET name_gujarati = 'પાપડ' WHERE slug = 'papad';
UPDATE public.food_items SET name_gujarati = 'અથાણું' WHERE slug = 'aachar';
UPDATE public.food_items SET name_gujarati = 'ગોળ' WHERE slug = 'gud';
UPDATE public.food_items SET name_gujarati = 'સલાડ' WHERE slug = 'fresh-salad';
