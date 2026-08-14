/** Prices come from the backend in Thai baht as a plain double. */
const baht = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatBaht(amount: number): string {
  return baht.format(amount)
}

/** For tight spots (cards, cart lines) where the ฿ sign is enough. */
export function formatBahtShort(amount: number): string {
  return `฿${Math.round(amount).toLocaleString('en-US')}`
}

export function pluralise(count: number, one: string, many: string): string {
  return count === 1 ? one : many
}
