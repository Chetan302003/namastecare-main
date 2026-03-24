import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./components/DashboardLayout";
import HomePage from "./pages/dashboard/HomePage";
import FamilyMembers from "./pages/dashboard/FamilyMembers";
import HealthRecords from "./pages/dashboard/HealthRecords";
import MedicineReminders from "./pages/dashboard/MedicineReminders";
import ProfilePage from "./pages/dashboard/ProfilePage";
import DoctorView from "./pages/DoctorView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<HomePage />} />
              <Route path="family" element={<FamilyMembers />} />
              <Route path="records" element={<HealthRecords />} />
              <Route path="medicines" element={<MedicineReminders />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="/doctor/:token" element={<DoctorView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
