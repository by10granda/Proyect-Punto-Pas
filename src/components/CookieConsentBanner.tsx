import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "puntopas_cookie_consent";

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice: "accepted" | "rejected") => {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-[9999] bg-[rgba(55,55,55,0.9)] text-white backdrop-blur-sm">
      <div className="mx-auto max-w-[1700px] px-4 py-5 md:px-8 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="md:max-w-[65%]">
            <h3 className="text-xl font-bold leading-none md:text-3xl">Ese sitio web utiliza cookies</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90 md:text-base">
              Utilizamos cookies para personalizar el contenido, los anuncios y analizar nuestro trafico.
              Tambien compartimos informacion sobre su uso de nuestro sitio con nuestros socios de publicidad y analisis.
              <span className="ml-1 text-[#ff8d8d]">Politica de privacidad</span>
            </p>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <button
              type="button"
              onClick={() => handleChoice("rejected")}
              aria-label="Preferencias de cookies"
              className="h-12 w-12 shrink-0 rounded-full bg-[#7a0011] text-white text-2xl font-bold transition hover:opacity-90"
            >
              
            </button>
            <div className="flex-1 md:min-w-[560px]">
              <button
                type="button"
                onClick={() => handleChoice("accepted")}
                className="w-full rounded-xl bg-[#ff9b9b] px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-95"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
