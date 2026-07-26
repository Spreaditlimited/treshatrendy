import { updateCurrencyAction } from "./actions";
import { currencies, type CurrencyCode } from "@/lib/store";

type CurrencySwitcherProps = {
  activeCurrency: CurrencyCode;
  redirectTo: string;
};

export function CurrencySwitcher({
  activeCurrency,
  redirectTo,
}: CurrencySwitcherProps) {
  return (
    <form action={updateCurrencyAction} className="flex gap-1 rounded-md border border-[#e8ded5] bg-white p-1">
      <input name="redirectTo" type="hidden" value={redirectTo} />
      {currencies.map((currency) => (
        <button
          className={`h-8 rounded px-3 text-xs font-bold ${
            activeCurrency === currency.code
              ? "bg-[#201713] text-white"
              : "text-[#5c4b42] hover:bg-[#fbfaf7]"
          }`}
          key={currency.code}
          name="currency"
          type="submit"
          value={currency.code}
        >
          {currency.code}
        </button>
      ))}
    </form>
  );
}
