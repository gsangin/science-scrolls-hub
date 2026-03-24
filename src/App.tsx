import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// 1. Optimized Query Client with staleTime to prevent aggressive re-fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 2. Lazy Loading: Components are only loaded when the route is visited
const Index = lazy(() => import("./pages/Index"));
const Physics = lazy(() => import("./pages/Physics"));
const Chemistry = lazy(() => import("./pages/Chemistry"));
const Biology = lazy(() => import("./pages/Biology"));
const Maths = lazy(() => import("./pages/Maths"));
const NotFound = lazy(() => import("./pages/NotFound"));

// 3. Loading Component (Fallback)
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Suspense handles the loading state for lazy-loaded routes */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/physics" element={<Physics />} />
            <Route path="/chemistry" element={<Chemistry />} />
            <Route path="/biology" element={<Biology />} />
            <Route path="/maths" element={<Maths />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THIS LINE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
