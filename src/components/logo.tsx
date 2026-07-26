import Link from "next/link";

type LogoProps = {
  href?: string;
  label?: string;
  className?: string;
  showWordmark?: boolean;
  adminLabel?: boolean;
};

const gold = "#b99a50";
const ink = "#201713";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="63" cy="14" fill={gold} r="8" />
      <circle cx="43" cy="74" fill={ink} r="7" />
      <circle cx="42" cy="105" fill={gold} r="8" />
      <text
        fill={ink}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="92"
        fontWeight="700"
        x="38"
        y="82"
      >
        T
      </text>
      <text
        fill={gold}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="76"
        fontWeight="700"
        x="18"
        y="88"
      >
        T
      </text>
    </svg>
  );
}

export function Logo({
  href = "/",
  label = "Treshatrendy",
  className = "",
  showWordmark = true,
  adminLabel = false,
}: LogoProps) {
  return (
    <Link
      aria-label={label}
      className={`inline-flex items-center gap-3 text-[#201713] ${className}`}
      href={href}
    >
      <LogoMark className="h-11 w-11 shrink-0" />
      {showWordmark ? (
        <span className="leading-none">
          <span className="block font-serif text-lg font-bold uppercase tracking-[0.13em]">
            Treshatrendy
          </span>
          {adminLabel ? (
            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3f2b]">
              Admin
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
