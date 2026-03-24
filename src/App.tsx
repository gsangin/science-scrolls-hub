import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Link, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { lazy, Suspense, useMemo } from "react";
import { Home, Atom, Beaker, BookOpen, Calculator } from "lucide-react";

const queryClient = new QueryClient();

// Lazy pages
const Index = lazy(() => import("./pages/Index.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const PdfViewer = lazy(() => import("./pages/PdfViewer.tsx"));
const AdminSettings = lazy(() => import("./pages/AdminSettings.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const Navigation = () => {
  const location = useLocation();
  const navItems = useMemo(() => [
    { path: "/", icon: <Home size={20} />, label: "Home" },
    { path: "/physics", icon: <Atom size={20} />, label: "Physics" },
    { path: "/chemistry", icon: <Beaker size={20} />, label: "Chemistry" },
    { path: "/biology", icon: <BookOpen size={20} />, label: "Biology" },
    { path: "/maths", icon: <Calculator size={20} />, label: "Maths" },
  ], []);

  return (
    <>
      {/* Desktop Top Nav */}
      <header className="hidden md:flex sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-bold text-xl tracking-tighter">Science Scrolls</Link>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.path ? "text-primary underline underline-offset-4" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-background/80 pb-6 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-background">
            <Navigation />
            {/* Main content area scales for desktop and mobile */}
            <main className="flex-1 w-full pb-24 md:pb-8">
              <Suspense fallback={
                <div className="flex h-[50vh] items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<Login />} />
                  <Route path="/view" element={<PdfViewer />} />
                  <Route path="/admin-settings" element={<AdminSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
