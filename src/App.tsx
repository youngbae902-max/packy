import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Packs from "./pages/Packs";
import Projetos from "./pages/Projetos";
import MCs from "./pages/MCs";
import Conta from "./pages/Conta";
import Admin from "./pages/Admin";
import Albums from "./pages/Albums";
import Sites from "./pages/Sites";
import Wishlist from "./pages/Wishlist";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import PublicProfile from "./pages/PublicProfile";
import CustomPage from "./pages/CustomPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Packs />} />
            <Route path="/projetos" element={<Projetos />} />
            <Route path="/mcs" element={<MCs />} />
            <Route path="/albuns" element={<Albums />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/desejos" element={<Wishlist />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/perfil/:userId" element={<PublicProfile />} />
            <Route path="/pagina/:slug" element={<CustomPage />} />
            <Route path="/conta" element={<Conta />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
