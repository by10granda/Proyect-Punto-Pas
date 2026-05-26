const PAYMENT_CARDS_BASE_URL = (import.meta.env.VITE_PAYMENT_CARDS_BASE_URL as string | undefined) || "";

const cloudinaryBadges = [
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573860/TARJETA1.png?v=20260526",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573861/TARJETA2.png?v=20260526",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573862/TARJETA3.png?v=20260526",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573863/TARJETA4.png?v=20260526",
  "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573864/TARJETA5.png?v=20260526",
];

const buildPaymentBadgeCandidates = (): string[][] => {
  const base = PAYMENT_CARDS_BASE_URL.replace(/\/$/, "");

  return [1, 2, 3, 4, 5].map((index) => {
    const fromEnv = base ? `${base}/${encodeURIComponent(`TARJETA${index}.png`)}` : "";
    const fromCloudinary = cloudinaryBadges[index - 1];
    const fromAssets = `https://assets.distribuidor-puntopas.com/TARGETAS/TARJETA${index}.png`;
    return [fromEnv, fromCloudinary, fromAssets].filter(Boolean);
  });
};

const buildPaymentBadges = (): string[] => {
  const candidates = buildPaymentBadgeCandidates();
  return candidates.map((group) => group[0]);
};

export const paymentBadges = buildPaymentBadges();
export const paymentBadgeCandidates = buildPaymentBadgeCandidates();
