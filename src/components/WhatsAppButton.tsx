import { useState } from "react";
import { Product } from "@/data/products";
import { ChatButton } from "@/components/chat/ChatButton";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface ChatAssistantProps {
  products?: Product[];
}

export const WhatsAppButton = ({ products = [] }: ChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const phone = "593959990999";
  const text = encodeURIComponent("Hola, quiero informacion de sus productos.");
  const href = `https://wa.me/${phone}?text=${text}`;

  return (
    <>
      {!isOpen ? (
        <ChatButton onClick={() => setIsOpen(true)} />
      ) : (
        <ChatWindow products={products} onClose={() => setIsOpen(false)} />
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]"
        aria-label="Abrir WhatsApp"
      >
        <img src="/whatsapp.png" alt="WhatsApp" className="w-7 h-7 object-contain" />
      </a>
    </>
  );
};
