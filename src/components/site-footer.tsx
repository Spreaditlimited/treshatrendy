import Link from "next/link";
import { Logo } from "@/components/logo";

const shopLinks = [
  { label: "All Collections", href: "/shop" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Children", href: "/children" },
  { label: "Wholesale", href: "/wholesale" },
];

const legalLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/treshatrendy/" },
  { label: "TikTok", href: "https://www.tiktok.com/@treshatrendycanada" },
  { label: "Facebook", href: "https://www.facebook.com/treshatrendycollections" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto grid max-w-[96rem] gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.9fr] lg:px-12">
        <div>
          <Logo className="text-white [&_span]:text-white" />
          <p className="mt-5 max-w-sm text-sm font-light leading-7 text-neutral-300">
            Curated contemporary African fashion for women, men and children,
            created for memorable dressing across generations.
          </p>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            House of Treshatrendy
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Contact
          </h3>
          <div className="mt-5 space-y-4 text-sm font-light leading-6 text-neutral-300">
            <p>
              <a className="transition hover:text-white" href="mailto:hello@treshatrendy.com">
                hello@treshatrendy.com
              </a>
            </p>
            <p>
              <a className="transition hover:text-white" href="tel:+16475533167">
                +1 (647) 553-3167
              </a>
              <br />
              <a className="transition hover:text-white" href="tel:+2348108803167">
                +234 810 880 3167
              </a>
            </p>
            <p>
              15/17 Falana Street,
              <br />
              Ejigbo, Lagos, Nigeria
            </p>
            <p>
              10 Challenger Court,
              <br />
              Scarborough, Ontario M1C 4V1,
              <br />
              Canada
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Shop
          </h3>
          <nav className="mt-5 grid gap-3 text-sm font-light text-neutral-300">
            {shopLinks.map((link) => (
              <Link className="transition hover:text-white" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Legal
          </h3>
          <nav className="mt-5 grid gap-3 text-sm font-light text-neutral-300">
            {legalLinks.map((link) => (
              <Link className="transition hover:text-white" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
            Follow
          </h3>
          <nav className="mt-5 grid gap-3 text-sm font-light text-neutral-300">
            {socialLinks.map((link) => (
              <a
                className="transition hover:text-white"
                href={link.href}
                key={link.href}
                rel="noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="mt-6 text-sm font-light leading-6 text-neutral-400">
            Prices are available in NGN, CAD and USD. Shipping is arranged after
            checkout for Nigeria, Canada and the United States.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-3 px-6 py-5 text-xs font-light uppercase tracking-[0.18em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <p>&copy; 2026 House of Treshatrendy. All rights reserved.</p>
          <p>Curated African Fashion for Every Generation</p>
        </div>
      </div>
    </footer>
  );
}
