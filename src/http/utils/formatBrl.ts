export default function formatBrl(number: Big) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number.mul(100).toNumber());
}
