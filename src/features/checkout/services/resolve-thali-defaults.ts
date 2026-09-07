import { fetchThaliOptionGroups } from '@/features/menu/services/thali-customizer-service'
import type { SelectedCustomization } from '@/features/cart/services/cart-service'

/**
 * Resolves today's default customizations for a Thali food item based on
 * currently available option items & daily menu selections.
 */
export async function resolveThaliDefaults(foodItemId: string): Promise<SelectedCustomization[]> {
  const groups = await fetchThaliOptionGroups(foodItemId)
  const defaults: SelectedCustomization[] = []

  for (const group of groups) {
    const availableOptions = group.options.filter((o) => o.is_available && !o.is_cutoff_closed)
    if (availableOptions.length === 0) continue

    // Prefer explicitly marked default, otherwise fallback to first available option
    const chosen = availableOptions.find((o) => o.is_default) ?? availableOptions[0]
    if (chosen) {
      defaults.push({
        id: chosen.id,
        name: chosen.label,
        price_delta: chosen.price_delta,
      })
    }
  }

  return defaults
}
