"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronsUpDown, Sparkles, Shirt, Images, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebaseConfig";
import { signOut } from "firebase/auth";
import { useState } from "react";

const navItems = [
  {
    label: "Style Advisor",
    id: "imageAdvisor",
    icon: Sparkles,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    label: "Virtual Try-On",
    id: "virtualTryon",
    icon: Shirt,
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
  },
  {
    label: "My Gallery",
    id: "gallery",
    icon: Images,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

// Mobile Bottom Navigation
export function MobileBottomNav({ activeComponent, setActiveComponent }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveComponent(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all",
              activeComponent === item.id
                ? "bg-gray-100"
                : "hover:bg-gray-50"
            )}
          >


            <item.icon
              className={cn(
                "h-5 w-5 transition-colors",
                activeComponent === item.id ? item.color : "text-gray-400"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors",
                activeComponent === item.id ? "text-gray-900" : "text-gray-400"
              )}
            >
              {item.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Desktop Sidebar
export function DashboardSidebar({ activeComponent, setActiveComponent }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside
        className={cn(
          "hidden md:block fixed left-0 top-0 z-50 h-full transition-all duration-300 ease-out",
          isCollapsed ? "w-20" : "w-72"
        )}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => {
          if (!showDropdown) {
            setIsCollapsed(true);
          }
        }}
      >
        <div className="h-full flex flex-col glass shadow-float rounded-r-2xl overflow-hidden">

          {/* Logo Header */}
          <div className="h-20 flex items-center px-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xs">FC</span>
              </div>
              <div className={cn(
                "flex flex-col transition-opacity duration-300",
                isCollapsed ? "opacity-0" : "opacity-100"
              )}>
                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  FitCheck AI
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 px-3 space-y-2 overflow-hidden hover:overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveComponent(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group relative",
                  activeComponent === item.id
                    ? "bg-white/60 shadow-sm"
                    : "hover:bg-white/40"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                  activeComponent === item.id ? item.bgColor : "bg-gray-100 group-hover:bg-white"
                )}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>

                <span className={cn(
                  "font-medium text-sm text-gray-700 whitespace-nowrap transition-opacity duration-300",
                  isCollapsed ? "opacity-0" : "opacity-100"
                )}>
                  {item.label}
                </span>

                {activeComponent === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* User Account Section */}
          <div className="p-4 border-t border-white/10 bg-white/30 backdrop-blur-md shrink-0">
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 hover:bg-transparent">
                  <div className="flex items-center gap-3 w-full overflow-hidden">
                    <Avatar className="h-8 w-8 border-2 border-white shadow-sm shrink-0">
                      <AvatarFallback className="bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white text-xs font-bold">
                        {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                      "flex flex-col items-start transition-opacity duration-300 min-w-0",
                      isCollapsed ? "opacity-0 w-0" : "opacity-100 flex-1"
                    )}>
                      <span className="text-xs font-semibold text-gray-800 truncate w-full text-left">
                        {user?.displayName || "User"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate w-full text-left">
                        {user?.email}
                      </span>
                    </div>

                    {!isCollapsed && (
                      <ChevronsUpDown className="h-3 w-3 text-gray-400 shrink-0" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2 ml-2" align="start" side="right">
                <DropdownMenuItem className="text-red-500 focus:text-red-500 cursor-pointer text-xs" onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
    </>
  );
}

