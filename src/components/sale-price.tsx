import {
  christmasSale,
  getChristmasSalePrice,
  isChristmasSaleActive,
} from "@/lib/christmas-sale";
import { formatPrice, type CurrencyCode } from "@/lib/store";

type SalePriceProps = {
  amount: number;
  currency: CurrencyCode;
  className?: string;
};

export function SalePrice({ amount, currency, className }: SalePriceProps) {
  const saleActive = isChristmasSaleActive();

  if (!saleActive) {
    return <span className={className}>{formatPrice(amount, currency)}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className ?? ""}`}>
      <span className="text-[#a4233a]">
        {formatPrice(getChristmasSalePrice(amount, currency), currency)}
      </span>
      <span className="text-xs font-normal text-[#76665e] line-through">
        {formatPrice(amount, currency)}
      </span>
      <span className="sr-only">{christmasSale.discountPercent}% off</span>
    </span>
  );
}
