import { ThumbsDown, ThumbsUp } from "lucide-react";
import { ChatMessageModel } from "./types";

interface ChatMessageProps {
  message: ChatMessageModel;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
      <div
        className={`max-w-[88%] px-5 py-4 text-[15px] leading-7 shadow-sm ${
          isAssistant
            ? "rounded-[22px] bg-[#f4f4f5] text-slate-900"
            : "rounded-[22px] rounded-tr-sm bg-[#ff0000] text-white"
        }`}
      >
        <p className="whitespace-pre-line">{message.text}</p>
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.products.slice(0, 3).map((product) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-2 flex items-center gap-2">
                <img src={product.image} alt={product.name} className="w-10 h-10 object-contain rounded-md bg-white" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-slate-800">{product.name}</p>
                  <p className="text-[11px] text-slate-600 truncate">{product.brand} - {product.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isAssistant && (
        <div className="mt-2 ml-5 flex items-center gap-4 text-xs text-slate-500">
          <span>Ahora</span>
          <span className="h-4 w-px bg-slate-300" />
          <button className="text-slate-500 hover:text-slate-900" aria-label="Respuesta útil">
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button className="text-slate-500 hover:text-slate-900" aria-label="Respuesta no útil">
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
