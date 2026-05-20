const PAYMENT_CARDS_BASE_URL = (import.meta.env.VITE_PAYMENT_CARDS_BASE_URL as string | undefined) || "";

const fallbackBadges = [
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778348731/TARJETA1.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778348732/TARJETA2.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778348732/TARJETA3.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778348732/TARJETA4.png",
  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778348732/TARJETA5.png",
];

const buildPaymentBadges = (): string[] => {
  const base = PAYMENT_CARDS_BASE_URL.replace(/\/$/, "");

  if (!base) {
    return fallbackBadges;
  }

  return [1, 2, 3, 4, 5].map((index) => `${base}/${encodeURIComponent(`TARJETA${index}.png`)}`);
};

export const paymentBadges = buildPaymentBadges();
