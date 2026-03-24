import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { Home, Atom, Beaker, BookOpen, Calculator } from "lucide-react";

// 1. High-Performance Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache notes for 5 minutes
      gcTime: 1000 * 60 * 30,    // Keep in memory for 30 minutes
      refetchOnWindowFocus: false, // Prevents battery drain on mobile
      retry: 1,
    },
  },
});

// 2. Asset-Light Lazy Loading
const Index = lazy(() => import("./pages/Index"));
const Physics = lazy(() => import("./pages/Physics"));
const Chemistry = lazy(() => import("./pages/Chemistry"));
const Biology = lazy(() => import("./pages/Biology"));
const Maths = lazy(() => import("./pages/Maths"));
const NotFound = lazy(() => import("./pages/NotFound"));

/**
 * Mobile Bottom Navigation
 * Optimized for thumb-reach and "Safe Area" insets on iOS/Android
 */
const BottomNav = () => {
  const location = useLocation();
  
  const navItems = useMemo(() => [
    { path: "/", icon: <Home size={22} />, label: "Home" },
    { path: "/physics", icon: <Atom size={22} />, label: "Physics" },
    { path: "/chemistry", icon: <Beaker size={22} />, label: "Chem" },
    { path: "/biology", icon: <BookOpen size={22} />, label: "Bio" },
    { path: "/maths", icon: <Calculator size={22} />, label: "Maths" },
  ], []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border/40 bg-background/80 pb-safe backdrop-blur-lg md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 ${
              isActive ? "text-primary font-bold" : "text-muted-foreground"
            }`}
          >
            <div className={isActive ? "scale-110 transition-transform" : ""}>
              {item.icon}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

// 3. Ultra-lightweight Loader for Mobile
const PageLoader = () => (
  <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    <p className="mt-4 text-xs font-medium text-muted-foreground animate-pulse">
      Opening the Scrolls...
    </p>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" /> {/* Toasts are easier to see at top on mobile */}
        <BrowserRouter>
          <div className="relative flex min-h-[100dvh] flex-col bg-background antialiased selection:bg-primary/10">
            
            {/* Main Scroll Content Area */}
            <main className="flex-1 pb-20 md:pb-0"> 
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/physics" element={<Physics />} />
                  <Route path="/chemistry" element={<Chemistry />} />
                  <Route path="/biology" element={<Biology />} />
                  <Route path="/maths" element={<Maths />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
