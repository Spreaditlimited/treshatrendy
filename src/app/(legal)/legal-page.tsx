import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: {
    title: string;
    body: string[];
  }[];
};

export function LegalPage({ eyebrow, title, description, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#FCFBFA] text-neutral-900">
      <header className="border-b border-neutral-100 bg-[#FCFBFA]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[96rem] items-center justify-between px-6 lg:px-12">
          <Logo />
          <Link
            className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600 transition hover:text-neutral-900"
            href="/shop"
          >
            Shop
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-12">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm font-light leading-7 text-neutral-500">
          {description}
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20 lg:px-12">
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {sections.map((section) => (
            <article className="py-8" key={section.title}>
              <h2 className="text-xl font-light tracking-tight">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm font-light leading-7 text-neutral-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
