import { FormEvent, useState } from "react";
import { Send, X } from "lucide-react";
import { Product } from "@/data/products";
import { askAssistant, ChatTurn } from "@/services/chatAssistant";
import { ChatMessage } from "./ChatMessage";
import { ChatMessageModel } from "./types";

interface ChatWindowProps {
  products: Product[];
  onClose: () => void;
}

const QUICK_ACTIONS = [
  "Que categorias manejan?",
  "Que marcas tienen disponibles?",
  "Tienen lavadoras disponibles?",
  "Donde estan sus sucursales?",
  "Como puedo comprar?",
];
const WHATSAPP_PHONE = "+593959990999";

export const ChatWindow = ({ products, onClose }: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [engine, setEngine] = useState<"ollama" | "fallback" | "ollama-unavailable">("fallback");
  const [messages, setMessages] = useState<ChatMessageModel[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hola, soy Russo. Estoy para ayudarte a comprar facil y rapido. Dime que producto buscas y te muestro opciones reales.",
    },
  ]);

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

  return (
    <div className="fixed bottom-5 right-3 left-3 sm:left-auto sm:right-4 z-50 w-auto sm:w-[390px] max-h-[76vh] bg-white rounded-2xl border border-slate-200 shadow-[0_20px_45px_-22px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-3 fade-in duration-300">
      <div className="px-4 py-3 bg-[#FA003F] text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Russo - Asistente Punto PAS</p>
          <p className="text-xs text-white/90">
            {engine === "ollama" ? "Modo IA: Ollama" : engine === "ollama-unavailable" ? "Modo IA: reconectando" : "Modo IA: respaldo"}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/15" aria-label="Cerrar asistente">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-slate-100 flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => void submitMessage(action)}
            className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            {action}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="max-w-[85%] px-3 py-2 rounded-2xl text-sm bg-white text-slate-600 border border-slate-200">
            Un momento... estoy revisando productos reales.
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-3 border-t border-slate-200 bg-white">
        <p className="text-[11px] text-slate-500 mb-2 px-1">Tip: escribe producto, marca, categoria o presupuesto.</p>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={280}
            placeholder="Ej: lavadora Mabe hasta 500"
            className="flex-1 h-10 rounded-full border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#FA003F] text-white flex items-center justify-center disabled:opacity-60"
            disabled={!input.trim() || isLoading}
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={openWhatsApp}
          className="mt-2 w-full h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
        >
          Ir a WhatsApp
        </button>
      </form>
    </div>
  );
};
