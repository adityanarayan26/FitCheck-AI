"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Blocks,
  ChevronsUpDown,
  LogOut,
  UserCircle,
  ImageIcon,
  SparklesIcon
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import LogoutButton from "@/app/(components)/LogoutButton";


const sidebarVariants = {
  open: { width: "15rem" },
  closed: { width: "3.05rem" },
};

const variants = {
  open: { x: 0, opacity: 1, transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { x: -20, opacity: 0, transition: { x: { stiffness: 100 } } },
};

const transitionProps = { type: "tween", ease: "easeOut", duration: 0.2 };

export function DashboardSidebar({ activeComponent, setActiveComponent }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems = [
    { name: 'imageAdvisor', label: 'Image Advisor', icon: ImageIcon },
    { name: 'virtualTryon', label: 'Virtual Try-on', icon: SparklesIcon },
  ];

  return (
    <motion.div
      className={cn("sidebar fixed left-0 z-40 h-full shrink-0 border-r")}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}>
      <motion.div
        className={`relative z-40 flex h-full shrink-0 flex-col bg-white text-muted-foreground transition-all dark:bg-black`}>
        <div className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            {/* Header / Org Dropdown */}
            <div className="flex h-[54px] w-full shrink-0 items-center border-b p-2">
                 <DropdownMenu modal={false}>
                
                    <Button variant="ghost" size="sm" className="flex w-fit items-center gap-2 px-2">
                      <Avatar className='rounded size-4'>
                        <AvatarFallback><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 20C0 12.5231 0 8.78461 1.60769 6C2.66091 4.17577 4.17577 2.66091 6 1.60769C8.78461 0 12.5231 0 20 0C27.4769 0 31.2154 0 34 1.60769C35.8242 2.66091 37.3391 4.17577 38.3923 6C40 8.78461 40 12.5231 40 20C40 27.4769 40 31.2154 38.3923 34C37.3391 35.8242 35.8242 37.3391 34 38.3923C31.2154 40 27.4769 40 20 40C12.5231 40 8.78461 40 6 38.3923C4.17577 37.3391 2.66091 35.8242 1.60769 34C0 31.2154 0 27.4769 0 20Z" fill="#00DC33"></path>
<path fill-rule="evenodd" clip-rule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367V25.0377C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927ZM20.0092 13.5651C18.6033 13.4489 17.1196 14.189 15.8013 15.8662C14.7973 17.1436 14.0376 18.8033 13.6503 20.5112C16.4093 21.4544 18.4655 21.4608 19.8942 21.0814C21.5481 20.6422 22.5399 19.6477 23.0172 18.5693C23.5137 17.4472 23.4628 16.2245 22.9813 15.3055C22.5369 14.4571 21.6422 13.7002 20.0092 13.5651Z" fill="#ffffff"></path>
</svg></AvatarFallback>
                      </Avatar>
                      <motion.li variants={variants} className="flex w-fit items-center gap-2">
                        {!isCollapsed && ( <> <p className="text-sm font-medium"> {"FitCheck AI"} </p></> )}
                      </motion.li>
                    </Button>
         
                  
                </DropdownMenu>
            </div>
            {/* Navigation Items */}
            <div className="flex h-full w-full grow flex-col gap-1 p-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Button
                            key={item.name}
                            variant="ghost"
                            onClick={() => setActiveComponent(item.name)}
                            className={cn(
                                "flex h-8 w-full flex-row items-center justify-start rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                                activeComponent === item.name && "bg-muted text-blue-600"
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <motion.span variants={variants} className="ml-2 whitespace-nowrap text-sm font-medium">
                                {!isCollapsed && item.label}
                            </motion.span>
                        </Button>
                    );
                })}
            </div>
            {/* Footer / Account Dropdown */}
            <div className="flex flex-col p-2">
                 <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <Avatar className="size-4"> <AvatarFallback> {user?.email?.[0].toUpperCase()} </AvatarFallback> </Avatar>
                        <motion.li variants={variants} className="flex w-full items-center gap-2">
                          {!isCollapsed && ( <> <p className="text-sm font-medium">Account</p> <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" /> </> )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6"> <AvatarFallback> {user?.email?.[0].toUpperCase()} </AvatarFallback> </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium"> {user?.displayName || "User"} </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground"> {user?.email} </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    
                      <DropdownMenuItem onClick={handleLogout} className="flex cursor-pointer items-center gap-2">
                        <LogoutButton className="h-4 w-4" /> 
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

