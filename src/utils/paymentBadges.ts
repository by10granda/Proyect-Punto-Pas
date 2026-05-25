const PAYMENT_CARDS_BASE_URL = (import.meta.env.VITE_PAYMENT_CARDS_BASE_URL as string | undefined) || "";

const fallbackBadges = [
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573863/TARJETA1.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA1.png",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573863/TARJETA2.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA2.png",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573863/TARJETA3.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA3.png",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573863/TARJETA4.png",
  "https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA4.png",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573863/TARJETA5.png",
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
