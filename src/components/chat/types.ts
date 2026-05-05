import { Product } from "@/data/products";

export interface ChatMessageModel {
  id: string;
  role: "assistant" | "user";
  text: string;
  products?: Product[];
}
