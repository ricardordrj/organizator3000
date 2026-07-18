import { useAppStore } from '@/store/useAppStore'

export function useShoppingItems() {
  const shoppingItems = useAppStore((state) => state.shoppingItems)
  const addShoppingItem = useAppStore((state) => state.addShoppingItem)
  const editShoppingItem = useAppStore((state) => state.editShoppingItem)
  const toggleShoppingItem = useAppStore((state) => state.toggleShoppingItem)
  const removeShoppingItem = useAppStore((state) => state.removeShoppingItem)

  return { shoppingItems, addShoppingItem, editShoppingItem, toggleShoppingItem, removeShoppingItem }
}
