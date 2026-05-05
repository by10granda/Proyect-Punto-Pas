import { ChatMessageModel } from "./types";

interface ChatMessageProps {
  message: ChatMessageModel;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`max-w-[90%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
        message.role === "assistant"
          ? "bg-white text-slate-700 border border-slate-200"
          : "bg-[#FA003F] text-white ml-auto"
      }`}
    >
      <p>{message.text}</p>
      {message.products && message.products.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.products.slice(0, 3).map((product) => (
            <div key={product.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center gap-2">
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
  );
};
