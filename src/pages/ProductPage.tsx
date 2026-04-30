import { Component, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductView } from "@/components/ProductView";
import { loadProductsFromAPI } from "@/data/products";
import { Product } from "@/data/products";
import { toast } from "sonner";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ProductPage Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-500 mb-6">
              Lo sentimos, hubo un error al cargar el producto.
            </p>
            <Button onClick={() => window.location.reload()} className="gap-2">
              Recargar página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProductPageContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await loadProductsFromAPI();
        const found = products.find((p: Product) => p.id === id);
        if (!found) {
          setError("Producto no encontrado");
        }
        setProduct(found || null);
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = (product: Product, quantity: number) => {
    toast.success(`${quantity}x ${product.name} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Producto no encontrado"}
          </h1>
          <p className="text-gray-500 mb-6">
            Lo sentimos, el producto que buscas no existe o ha sido eliminado.
          </p>
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <span className="text-sm text-gray-500 hidden sm:block">
              {product.category || "Producto"}
            </span>
          </div>
        </div>
      </div>
      <ProductView product={product} onAddToCart={handleAddToCart} />
    </>
  );
};

const ProductPage = () => {
  return (
    <ErrorBoundary>
      <ProductPageContent />
    </ErrorBoundary>
  );
};

export default ProductPage;
