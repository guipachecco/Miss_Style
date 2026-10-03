import { LinkWhatsApp } from "@/components/ui/LinkWhatsApp";

export function WhatsAppFlutuante() {
  return (
    <LinkWhatsApp
      origem="flutuante"
      aria-label="Falar no WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex h-14 items-center gap-2 rounded-full bg-ouro-escuro px-5 text-sm tracking-wide text-marfim shadow-lg transition-transform hover:scale-105 md:right-8 md:bottom-8"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.93 9.93 0 0 0-8.5 15.1L2 22l5.05-1.32A9.94 9.94 0 1 0 12.04 2Zm0 18.13a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3 .79.8-2.92-.2-.31a8.2 8.2 0 1 1 6.88 3.76Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22a7.4 7.4 0 0 1-1.37-1.7c-.14-.25 0-.38.1-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.54.12.16 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.16-.48-.29Z" />
      </svg>
      <span className="hidden sm:inline">Falar no WhatsApp</span>
    </LinkWhatsApp>
  );
}
