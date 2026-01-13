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
        className="hidden md:block fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-zinc-200"
      >
        <div className="h-full flex flex-col">

          {/* Logo Header */}
          <div className="h-14 flex items-center px-6 border-b border-zinc-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-lime flex items-center justify-center shadow-sm">
                <span className="text-black font-bold text-xs">FC</span>
              </div>
              <span className="text-sm font-bold text-zinc-900">
                FitCheck AI
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-zinc-400 px-2 mb-2 uppercase tracking-wider">
              Menu
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveComponent(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                  activeComponent === item.id
                    ? "bg-brand-lime text-black shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-colors",
                  activeComponent === item.id ? "text-black" : "text-zinc-400 group-hover:text-zinc-600"
                )} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Account Section */}
          <div className="p-4 border-t border-zinc-100 shrink-0">
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-zinc-50 rounded-lg">
                  <div className="flex items-center gap-3 w-full overflow-hidden">
                    <Avatar className="h-8 w-8 border border-zinc-200 shrink-0">
                      <AvatarFallback className="bg-zinc-100 text-zinc-700 text-xs font-bold">
                        {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-xs font-medium text-zinc-900 truncate w-full text-left">
                        {user?.displayName || "User"}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate w-full text-left">
                        {user?.email}
                      </span>
                    </div>

                    <ChevronsUpDown className="h-3 w-3 text-zinc-400 shrink-0" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 mb-2 ml-2" align="start" side="top">
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

