'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/ui/sidebar';
import ImageAdvisor from '../(components)/ImageAdvisor';
import VirtualTryOn from '../(components)/VirtualTryOn';
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
      default:
        return <ImageAdvisor />;
    }
  };

  return (
    <div className='min-h-screen w-full bg-slate-50 relative'>
      {/* Sidebar */}
      <DashboardSidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />

      {/* Main Content Area */}
      <main className='pl-24 pr-8 pt-8 pb-12 min-h-screen transition-all duration-300'>
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Clean Header Section */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, {user?.displayName || 'Fashionista'}
            </h1>
            <p className="text-gray-500 text-lg">
              {activeComponent === 'imageAdvisor'
                ? 'Get personalized style advice for your outfits'
                : 'Try on clothes virtually before you buy'
              }
            </p>
          </div>

          {/* Content Area - Clean Layout */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-sm p-1">
            {renderComponent()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage;
