import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { BookOpen, Atom, Beaker, Calculator, Home } from "lucide-react"; // From your package.json dependencies

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false, 
    },
  },
});

// Lazy loaded pages
const Index = lazy(() => import("./pages/Index"));
const Physics = lazy(() => import("./pages/Physics"));
const Chemistry = lazy(() => import("./pages/Chemistry"));
const Biology = lazy(() => import("./pages/Biology"));
const Maths = lazy(() => import("./pages/Maths"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Mobile Bottom Navigation Component
const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: "/", icon: <Home size={20} />, label: "Home" },
    { path: "/physics", icon: <Atom size={20} />, label: "Physics" },
    { path: "/chemistry", icon: <Beaker size={20} />, label: "Chem" },
    { path: "/biology", icon: <BookOpen size={20} />, label: "Bio" },
    { path: "/maths", icon: <Calculator size={20} />, label: "Maths" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 pb-safe backdrop-blur-md md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-colors ${
            location.pathname === item.path ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-[100dvh] flex-col pb-16 md:pb-0"> {/* Padding bottom for Nav */}
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Hub...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/physics" element={<Physics />} />
              <Route path="/chemistry" element={<Chemistry />} />
              <Route path="/biology" element={<Biology />} />
              <Route path="/maths" element={<Maths />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
