import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Link, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense, useMemo } from "react";
import { Home, Atom, Beaker, BookOpen, Calculator } from "lucide-react";

// Lazy loading pages for better performance
const Index = lazy(() => import("./pages/Index.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const PdfViewer = lazy(() => import("./pages/PdfViewer.tsx"));
const AdminSettings = lazy(() => import("./pages/AdminSettings.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
  },
});

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
            <div className={isActive ? "scale-110" : ""}>{item.icon}</div>
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
      <AuthProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="flex min-h-[100dvh] flex-col bg-background">
            {/* Main content area: Padding removed for mobile to allow large previews */}
            <main className="flex-1 pb-24 px-0 sm:px-4"> 
              <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<Login />} />
                  <Route path="/view" element={<PdfViewer />} />
                  <Route path="/admin-settings" element={<AdminSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <BottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
