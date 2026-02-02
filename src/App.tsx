import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Auth Pages
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Dashboard Pages
import Home from "./pages/Home";
import Overview from "./pages/Overview";
import DatasetUpload from "./pages/DatasetUpload";
import Prediction from "./pages/Prediction";
import WhatIfAnalysis from "./pages/WhatIfAnalysis";
import Productivity from "./pages/Productivity";
import Analytics from "./pages/Analytics";
import MLModels from "./pages/MLModels";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="churn-analytics-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Home />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overview"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Overview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dataset"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DatasetUpload />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prediction"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Prediction />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/what-if"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <WhatIfAnalysis />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productivity"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Productivity />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ml-models"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MLModels />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
