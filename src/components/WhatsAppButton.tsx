import { useState } from "react";
import { Product } from "@/data/products";
import { ChatButton } from "@/components/chat/ChatButton";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface ChatAssistantProps {
  products?: Product[];
}

export const WhatsAppButton = ({ products = [] }: ChatAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return <ChatButton onClick={() => setIsOpen(true)} />;
  }

  return <ChatWindow products={products} onClose={() => setIsOpen(false)} />;
};
