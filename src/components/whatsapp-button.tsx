"use client";

import { usePathname } from "next/navigation";

const whatsappNumber = "16475533167";
const message =
  "Hi Treshatrendy, I'm interested in your African fashion collections.";

export function WhatsAppButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      aria-label="Chat with Treshatrendy on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-3 rounded-full bg-[#1f7a4d] px-4 pr-5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#17643e] focus:outline-none focus:ring-4 focus:ring-[#1f7a4d]/25"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-white text-[#1f7a4d]">
        <svg
          aria-hidden="true"
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19.1 4.9A9.85 9.85 0 0 0 12.08 2 9.92 9.92 0 0 0 3.5 16.9L2 22l5.24-1.38A9.9 9.9 0 0 0 12.08 22h.01A9.91 9.91 0 0 0 22 12.08a9.83 9.83 0 0 0-2.9-7.18Zm-7.01 15.43h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.22 8.22 0 1 1 6.98 3.85Zm4.51-6.17c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.24 3.75.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.14-1.17-.06-.11-.22-.17-.47-.29Z" />
        </svg>
      </span>
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
