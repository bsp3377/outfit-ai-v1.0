import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Studio } from './components/Studio';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './types';

type View = 'landing' | 'studio';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleStart = () => {
    if (user) {
      setCurrentView('studio');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setCurrentView('landing');
  };

  const handleCreditUpdate = (newCredits: number) => {
    if (user) {
      setUser({ ...user, credits: newCredits });
    }
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsAuthModalOpen(false);
    setCurrentView('studio');
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage
          onStart={handleStart}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <Studio
          onBack={() => setCurrentView('landing')}
          user={user}
          onCreditUpdate={handleCreditUpdate}
          onLogout={handleLogout}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}