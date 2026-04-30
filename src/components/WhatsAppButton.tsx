import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const phoneNumber = "+593959990999";
  const message = "Hola, me interesa obtener más información sobre sus productos.";
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/\+/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 animate-bounce"
      style={{ animationDuration: "2s" }}
      aria-label="Contactar por WhatsApp"
    >
      <img 
        src="/whatsapp.png" 
        alt="WhatsApp"
        className="w-7 h-7"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'block';
          }
        }}
      />
      <MessageCircle className="w-7 h-7 text-white" style={{ display: 'none' }} />
      
      {/* Pulse effect */}
      <span className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-30" />
    </button>
  );
};
