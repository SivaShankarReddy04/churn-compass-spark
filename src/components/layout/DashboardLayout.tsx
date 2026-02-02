import { useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import UserMenu from "@/components/dashboard/UserMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && <AppSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            {isMobile && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <AppSidebar />
                </SheetContent>
              </Sheet>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                Churn Prediction & Retention Analytics
              </p>
              <p className="text-xs text-muted-foreground">
                XGBoost model predictions • Real-time analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden md:block mr-2">
              <p className="text-xs text-muted-foreground">Data Updated</p>
              <p className="text-xs font-medium">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 xl:p-8">
          {children}
          
          {/* Footer */}
          <footer className="text-center py-6 border-t border-border/50 mt-8">
            <p className="text-xs sm:text-sm text-muted-foreground">
              ChurnGuard Analytics Platform • XGBoost Model Predictions • Built for Data-Driven Retention Decisions
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
