'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/ui/sidebar';
import ImageAdvisor from '../(components)/ImageAdvisor';
import VirtualTryOn from '../(components)/VirtualTryOn';
import ImageGallery from '../(components)/ImageGallery';
import { Sparkles } from 'lucide-react';


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('imageAdvisor');

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const renderComponent = () => {
    switch (activeComponent) {
      case 'imageAdvisor':
        return <ImageAdvisor />;
      case 'virtualTryon':
        return <VirtualTryOn />;
      case 'gallery':
        return <ImageGallery />;
      default:
        return <ImageAdvisor />;
    }
  };

  return (
    <div className='flex h-screen w-full bg-zinc-50 overflow-hidden'>
      {/* Sidebar */}
      <DashboardSidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />

      {/* Main Content Area */}
      <main className='flex-1 flex flex-col h-full relative transition-all duration-300 md:pl-72'>
        {/* Top Header - Minimal */}
        <header className="h-14 border-b border-zinc-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-500">Dashboard</span>
            <span className="text-zinc-300">/</span>
            <span className="text-sm font-semibold text-zinc-900">
              {activeComponent === 'imageAdvisor' ? 'Style Advisor' :
                activeComponent === 'virtualTryon' ? 'Virtual Try-On' : 'Gallery'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Profile info removed */}
          </div>
        </header>

        {/* Component Area - Fills remaining space */}
        <div className="flex-1 overflow-hidden relative">
          {renderComponent()}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage;
