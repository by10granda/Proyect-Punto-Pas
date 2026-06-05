import { FormEvent, useState } from "react";
import { RefreshCcw, Send, X } from "lucide-react";
import { Product } from "@/data/products";
import { askAssistant, ChatTurn } from "@/services/chatAssistant";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageModel } from "./types";

interface ChatWindowProps {
  products: Product[];
  onClose: () => void;
}

const WHATSAPP_PHONE = "+593959990999";
const WELCOME_MESSAGE: ChatMessageModel = {
  id: "welcome",
  role: "assistant",
  text: "¡Hola! Soy el Asesor Punto PAS. Te ayudo con productos, precios, marcas, categorías, sucursales, formas de compra y políticas de la tienda. ¿Qué estás buscando?",
};

export const ChatWindow = ({ products, onClose }: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [engine, setEngine] = useState<"openai" | "openai-unavailable" | "ollama" | "fallback" | "ollama-unavailable">("fallback");
  const [messages, setMessages] = useState<ChatMessageModel[]>([WELCOME_MESSAGE]);

  const submitMessage = async (rawMessage?: string) => {
    const message = (rawMessage ?? input).trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessageModel = { id: `u-${Date.now()}`, role: "user", text: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const history: ChatTurn[] = messages.slice(-6).map((item) => ({ role: item.role, text: item.text }));
    const reply = await askAssistant(message, products, history);
    const assistantMessage: ChatMessageModel = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: reply.text,
      products: reply.products,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setEngine(reply.source || "fallback");
    setIsLoading(false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submitMessage();
  };

  const openWhatsApp = () => {
    const lastUserMessage = [...messages].reverse().find((item) => item.role === "user")?.text;
    const text = lastUserMessage
      ? `Hola, soy cliente de Punto PAS. Quiero ayuda con: ${lastUserMessage}`
      : "Hola, soy cliente de Punto PAS y quiero ayuda para comprar.";
    const url = `https://wa.me/${WHATSAPP_PHONE.replace(/\+/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setEngine("fallback");
  };

  return (
    <div className="fixed bottom-5 right-3 left-3 sm:left-auto sm:right-4 z-50 w-auto sm:w-[420px] h-[78vh] max-h-[760px] bg-white rounded-[28px] border border-slate-200 shadow-[0_26px_70px_-28px_rgba(15,23,42,0.55)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-300">
      <div className="px-6 py-5 bg-[#ff0000] text-white flex items-center justify-between">
        <div>
          <p className="text-lg font-bold">Distribuidor Punto Pas</p>
          <p className="mt-1 text-xs text-white/80">
            {engine === "openai" ? "Asesor virtual activo" : engine === "openai-unavailable" ? "Reconectando asesor" : "Asesor virtual"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetChat}
            className="p-2 rounded-full text-white/85 hover:bg-white/15 hover:text-white transition-colors"
            aria-label="Reiniciar chat"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full text-white/85 hover:bg-white/15 hover:text-white transition-colors" aria-label="Cerrar asistente">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white [scrollbar-color:#9ca3af_transparent] [scrollbar-width:thin]">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="max-w-[88%] px-5 py-4 rounded-[22px] text-[15px] bg-[#f4f4f5] text-slate-700">
            Un momento... estoy revisando la información de la tienda.
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-4 bg-white">
        <div className="flex items-center gap-2 rounded-full border border-slate-900 bg-white px-4 py-2 shadow-sm">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={280}
            placeholder="Mensaje..."
            className="flex-1 h-10 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center transition hover:bg-[#ff0000] hover:text-white disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-400"
            disabled={!input.trim() || isLoading}
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={openWhatsApp}
          className="mt-3 w-full h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
        >
          Ir a WhatsApp
        </button>
      </form>
    </div>
  );
};
