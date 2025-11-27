import React, { createContext, useState, useEffect, useContext } from 'react';
import { TONES } from '../services/aiPrompts';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Configuración técnica (Provider, Key, Modelo)
  const [aiConfig, setAiConfig] = useState({
    provider: 'openai', 
    // ¡OJO! En un SaaS real, la key NO se guarda aquí en el cliente. 
    // Esto es para desarrollo o modo BYOK.
    apiKey: '', 
    model: 'gpt-3.5-turbo'
  });

  // Tono de Edición seleccionado
  const [tone, setTone] = useState(TONES.LITERARY);

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('style_opt_ai_config');
    const savedTone = localStorage.getItem('style_opt_tone');
    
    if (savedConfig) setAiConfig(JSON.parse(savedConfig));
    if (savedTone) setTone(savedTone);
  }, []);

  const updateAiConfig = (newConfig) => {
    setAiConfig(newConfig);
    localStorage.setItem('style_opt_ai_config', JSON.stringify(newConfig));
  };

  const updateTone = (newTone) => {
    setTone(newTone);
    localStorage.setItem('style_opt_tone', newTone);
  };

  return (
    <AppContext.Provider value={{ aiConfig, updateAiConfig, tone, updateTone }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);