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
    <div className='min-h-screen w-full bg-mesh-gradient relative'>
      {/* Sidebar */}
      <DashboardSidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />

      {/* Main Content Area - Responsive padding */}
      <main className='px-4 pt-4 pb-24 md:pl-24 md:pr-8 md:pt-4 md:pb-12 min-h-screen transition-all duration-300'>
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Top Bar - Welcome Text Fixed Right */}
          <div className="flex justify-end items-center">
            <div className="text-right">
              <p className="text-xs md:text-sm font-medium text-gray-600">
                Welcome back, <span className="text-gray-900">{user?.displayName?.split(' ')[0] || 'Fashionista'}</span>
              </p>
              <p className="text-[10px] md:text-xs text-gray-400">
                {activeComponent === 'imageAdvisor'
                  ? 'Get personalized style advice for your outfits'
                  : activeComponent === 'virtualTryon'
                    ? 'Try on clothes virtually before you buy'
                    : 'View your saved style analyses and try-ons'
                }
              </p>
            </div>
          </div>

          {/* Content Area - Clean Layout */}
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 shadow-sm">
            {renderComponent()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage;
