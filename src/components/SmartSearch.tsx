import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Mic, X } from "lucide-react";
import { Product } from "@/data/products";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: { [0]: { [0]: { transcript: string } } }[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SmartSearchProps {
  products: Product[];
  onSearch: (query: string) => void;
  onProductClick?: (product: Product) => void;
  popularSearches?: string[];
}

const SYNONYMS: Record<string, string[]> = {
  tv: ["televisor", "television", "smart tv", "tv smart"],
  refri: ["refrigerador", "refrigeradora", "frigorifico", "nevera"],
  laptop: ["portatil", "portátil", "notebook", "computador"],
  celular: ["telefono", "teléfono", "smartphone", "movil", "móvil"],
  lavadora: ["lava ropa", "lavarropas"],
  secadora: ["seca ropa", "secarropas"],
  cocina: ["estufa", "cocina"],
  microwave: ["microondas", "microonda"],
  aire: ["ac", "aire acondicionado", "refrigeracion"],
  sonido: ["bocina", "parlante", "audio", "altavoz"],
  juego: ["videojuego", "gamer", "gaming", "consola"],
};

const ATTRIBUTE_KEYWORDS: Record<string, string[]> = {
  grande: [" grande", "lg", "xl", "large", "40 pies", "50 pulg", "55 pulg"],
  pequena: ["pequeño", "pequeña", "chico", "sm", "small", "20 pulg"],
  medianas: ["mediano", "mediana", "md", "30 pulg"],
  inverter: ["inverter", "dual inverter"],
  economico: ["economico", "económico", "barato", "oferta", "descuento"],
  capacidad: ["pies", "pies cubic", "litros", "kg"],
  pulgadas: ["pulg", "pulgadas", "''"],
  quemadores: ["hornilla", "quemador", "burner"],
  tono: ["tono", "color"],
};

const CATEGORY_MATCHES: Record<string, string[]> = {
  lavadoras: ["lavadora", "lava ropa", "lavarropas"],
  refrigeradores: ["refrigerador", "refrigeradora", "nevera", "heladera"],
  televisor: ["tv", "televisor", "television", "smart tv"],
  cocinas: ["cocina", "estufa", "cocina integral"],
  microondas: ["microondas", "microonda"],
  colchones: ["colchon", "cama", "sleep"],
  mascotas: ["mascota", "perro", "gato"],
};

export const SmartSearch = ({ 
  products, 
  onSearch, 
  onProductClick,
  popularSearches = ["Lavadoras", "Televisores", "Refrigeradores", "Celulares"]
}: SmartSearchProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "es-ES";
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ");
  };

  const expandSynonyms = (text: string) => {
    const normalized = normalizeText(text);
    const words = normalized.split(/\s+/);
    const expanded = [...words];
    
    Object.entries(SYNONYMS).forEach(([key, synonyms]) => {
      if (words.includes(key)) {
        expanded.push(...synonyms);
      }
    });
    
    return expanded;
  };

  const getAttributeMatches = (text: string) => {
    const normalized = normalizeText(text);
    const matches: string[] = [];
    
    Object.entries(ATTRIBUTE_KEYWORDS).forEach(([attr, keywords]) => {
      keywords.forEach(kw => {
        if (normalized.includes(kw.toLowerCase().replace(" ", ""))) {
          matches.push(attr);
        }
      });
    });
    
    return matches;
  };

  const calculateRelevance = (product: Product, searchTerms: string[]) => {
    let score = 0;
    const normalizedQuery = normalizeText(query);
    
    if (product.name && normalizeText(product.name).includes(normalizedQuery)) score += 100;
    if (product.brand && normalizeText(product.brand).includes(normalizedQuery)) score += 80;
    if (product.category && normalizeText(product.category).includes(normalizedQuery)) score += 60;
    if (product.description && normalizeText(product.description).includes(normalizedQuery)) score += 40;
    
    if (product.stock && product.stock > 0) score += 20;
    if (product.discount && product.discount > 0) score += 10;
    
    searchTerms.forEach(term => {
      const termNorm = normalizeText(term);
      if (product.name && normalizeText(product.name).includes(termNorm)) score += 50;
      if (product.brand && normalizeText(product.brand).includes(termNorm)) score += 30;
    });
    
    return score;
  };

const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    if (!products || products.length === 0) return [];

    const searchTerms = expandSynonyms(query);
    const normalizedQuery = normalizeText(query);
    
    const results = products
      .filter(p => p && p.isActive)
      .map(product => ({
        product,
        relevance: calculateRelevance(product, searchTerms)
      }))
      .filter(r => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8)
      .map(r => r.product);

    return results;
  }, [query, products]);

  const categorySuggestions = useMemo(() => {
    if (!query.trim()) return [];
    if (!products || products.length === 0) return [];
    
    const normalized = normalizeText(query);
    const suggestions = new Set<string>();
    
    Object.entries(CATEGORY_MATCHES).forEach(([category, keywords]) => {
      keywords.forEach(kw => {
        if (normalizeText(kw).includes(normalized) || normalized.includes(normalizeText(kw))) {
          suggestions.add(category);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 4);
  }, [query]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;
    
    try {
      const newRecent = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));
      
      onSearch(finalQuery);
      setIsOpen(false);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setQuery("");
    }
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-lg">
      <div className="relative flex items-center bg-white rounded-full border border-gray-200 overflow-hidden">
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => {
            console.log("SmartSearch onChange:", e.target.value);
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="w-full pl-9 pr-24 py-2 text-sm bg-transparent focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-12 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={startListening}
          className={`absolute right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          <Mic className={`w-3.5 h-3.5 ${isListening ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {searchResults.slice(0, 4).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors text-left"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-contain rounded-lg bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <span className="text-sm font-bold text-red-500">
                    ${product.price?.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && (
            <div className="p-3 text-center">
              <p className="text-gray-400 text-sm">Sin resultados</p>
            </div>
          )}

          {categorySuggestions.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {categorySuggestions.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleSearch(cat)}
                    className="px-3 py-1 text-xs bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};