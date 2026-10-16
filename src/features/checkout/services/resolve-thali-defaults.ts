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

    // A group like Sabji in Premium/Deluxe may require 2 selections
    const requiredCount = Math.max(1, group.min_select || 1)
    const chosenList: typeof availableOptions = []

    // 1. First add explicitly marked defaults
    availableOptions
      .filter((o) => o.is_default)
      .forEach((opt) => {
        if (chosenList.length < requiredCount && !chosenList.some((c) => c.id === opt.id)) {
          chosenList.push(opt)
        }
      })

    // 2. If more are needed to fulfill requiredCount, pick from available options
    for (const opt of availableOptions) {
      if (chosenList.length >= requiredCount) break
      if (!chosenList.some((c) => c.id === opt.id)) {
        chosenList.push(opt)
      }
    }

    chosenList.forEach((chosen) => {
      defaults.push({
        id: chosen.id,
        name: chosen.label,
        price_delta: chosen.price_delta,
      })
    })
  }

  return defaults
}
