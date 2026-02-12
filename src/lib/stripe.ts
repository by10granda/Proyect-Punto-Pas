import { loadStripe } from "@stripe/stripe-js";

// Tu Publishable Key de Stripe (reemplaza con tu key real)
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_tu_key_aqui");
