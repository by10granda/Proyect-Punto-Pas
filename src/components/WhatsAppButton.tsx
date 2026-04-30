import { MessageCircle } from "lucide-react";
import socialIcon from "@/assets/social.png";

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
        src={socialIcon} 
        alt="WhatsApp"
        className="w-7 h-7"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'block';
          }
        }}
      />
      <svg 
        className="w-7 h-7 text-white" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        style={{ display: 'none' }}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.197-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.299.248-.458.099-.297-.15-1.256-.596-2.385-1.465-.881-.741-1.475-1.653-1.653-1.951-.173-.297-.017-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.299.248-.458.099zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
      
      {/* Pulse effect */}
      <span className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-30" />
    </button>
  );
};
