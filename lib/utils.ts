export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateReceiveAmount(
  sendAmount: number,
  sendCurrency: string,
  receiveCurrency: string,
  rates: Record<string, Record<string, number>>
): number {
  const rate = rates[sendCurrency]?.[receiveCurrency];
  if (!rate) return 0;
  return sendAmount * rate;
}
