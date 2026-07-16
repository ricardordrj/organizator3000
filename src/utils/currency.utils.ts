export function formatCentsBRL(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export function parseCurrencyInputToCents(value: string): number | undefined {
  const normalized = value.replace(/\./g, '').replace(',', '.').trim()
  if (!normalized) return undefined
  const asNumber = Number(normalized)
  if (Number.isNaN(asNumber)) return undefined
  return Math.round(asNumber * 100)
}
