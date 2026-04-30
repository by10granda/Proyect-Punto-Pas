import { Facebook } from "lucide-react";

export const TopBar = () => {
  return (
    <div className="hidden md:block h-10 w-full" style={{ backgroundColor: '#FE4439' }}>
      <div className="max-w-[98vw] mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white font-medium" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            Bienvenido a Punto Pas
          </span>
        </div>

        <div className="hidden lg:block">
          <span className="text-sm text-white font-semibold tracking-wider" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            ENCUENTRA TODO EN UN SOLO LUGAR
          </span>
        </div>

<div className="flex items-center gap-4">
          <a 
            href="https://www.facebook.com/profile.php?id=100063756541859" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a 
            href="https://www.tiktok.com/@punto_pas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src="/tik-tok.png" 
              alt="TikTok" 
              className="w-4 h-4 object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  );
};