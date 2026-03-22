/** App-wide money display: Philippine peso (₱). */
export function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
