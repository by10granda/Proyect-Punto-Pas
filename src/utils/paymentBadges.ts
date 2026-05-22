const PAYMENT_CARDS_BASE_URL = (import.meta.env.VITE_PAYMENT_CARDS_BASE_URL as string | undefined) || "";

const fallbackBadges = [
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA1.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA2.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA3.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA4.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA5.png",
];

const buildPaymentBadges = (): string[] => {
  const base = PAYMENT_CARDS_BASE_URL.replace(/\/$/, "");

  if (!base) {
    return fallbackBadges;
  }

  return [1, 2, 3, 4, 5].map((index) => `${base}/${encodeURIComponent(`TARJETA${index}.png`)}`);
};

export const paymentBadges = buildPaymentBadges();
