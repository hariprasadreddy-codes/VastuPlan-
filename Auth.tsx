import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import HomeDashboard from './components/Home';
import DesignStudio from './components/Design3D';
import BudgetPlanner from './components/Budget';
import Chatbot from './components/Chatbot';
import { User, Language } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState<Language>('en');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleVoiceTranscript = (text: string) => {
    setVoiceTranscript(text);
    setActiveTab('chat');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      language={language} 
      setLanguage={setLanguage}
      onLogout={handleLogout}
      onVoiceTranscript={handleVoiceTranscript}
    >
      {activeTab === 'home' && <HomeDashboard />}
      {activeTab === 'sketch' && <DesignStudio />}
      {activeTab === 'budget' && <BudgetPlanner />}
      {activeTab === 'chat' && <Chatbot voiceTranscript={voiceTranscript} />}
    </Layout>
  );
}
