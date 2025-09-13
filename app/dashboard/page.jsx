'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/ui/sidebar';
import ImageAdvisor from '../(components)/ImageAdvisor';
import VirtualTryOn from '../(components)/VirtualTryOn';


const DashboardPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('imageAdvisor'); // Default component

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-300">
            <p>Loading...</p>
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
    <div className='h-screen w-full bg-zinc-300 '>
      <DashboardSidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      <main className='pl-16 h-full overflow-y-auto'>
        {renderComponent()}
      </main>
    </div>
  )
}

export default DashboardPage;

