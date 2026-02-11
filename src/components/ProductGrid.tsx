import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  title?: string;
}

export const ProductGrid = ({ products, onAddToCart, onProductClick, title }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          No encontramos productos
        </h3>
        <p className="text-muted-foreground">
          Intenta con otra búsqueda o categoría
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-12">
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-black text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{title}</h2>
          <span className="text-xs text-muted-foreground">{products.length} productos</span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
};
