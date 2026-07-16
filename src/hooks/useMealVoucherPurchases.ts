import { useAppStore } from '@/store/useAppStore'

export function useMealVoucherPurchases() {
  const mealVoucherPurchases = useAppStore((state) => state.mealVoucherPurchases)
  const addMealVoucherPurchase = useAppStore((state) => state.addMealVoucherPurchase)
  const removeMealVoucherPurchase = useAppStore((state) => state.removeMealVoucherPurchase)

  return { mealVoucherPurchases, addMealVoucherPurchase, removeMealVoucherPurchase }
}
