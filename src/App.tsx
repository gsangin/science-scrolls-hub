import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import { Home, Atom, Beaker, BookOpen, Calculator } from "lucide-react";

// Optimized Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy Pages (Faster mobile loading)
const Index = lazy(() => import("./pages/Index"));
const Physics = lazy(() => import("./pages/Physics"));
const Chemistry = lazy(() => import("./pages/Chemistry"));
const Biology = lazy(() => import("./pages/Biology"));
const Maths = lazy(() => import("./pages/Maths"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Mobile Bottom Navigation Bar
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-border/50 bg-background/80 pb-6 backdrop-blur-xl md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className={`${isActive ? "scale-110 shadow-lg shadow-primary/10" : ""}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <div className="flex min-h-[100dvh] flex-col bg-background selection:bg-primary/10">
          <main className="flex-1 pb-24"> {/* Extra padding for the bottom nav */}
            <Suspense fallback={
              <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }>
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

export default App;
