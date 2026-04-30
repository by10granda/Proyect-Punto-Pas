import { Home, Grid3X3, Tag, ShoppingCart } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

export const BottomNav = ({ activeTab, onTabChange, cartCount }: BottomNavProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Inicio" },
    { id: "categories", icon: Grid3X3, label: "Categorías" },
    { id: "offers", icon: Tag, label: "Ofertas" },
    { id: "cart", icon: ShoppingCart, label: "Carrito", badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-center">
        <div className="bg-card border-t border-border shadow-lg rounded-t-2xl">
          <div className="flex items-center justify-around py-2 px-4 w-[320px] sm:w-[400px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-200 relative ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : ""}`} />
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                        {tab.badge > 99 ? "99+" : tab.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
