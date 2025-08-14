import { useEffect, useState } from 'react';

export function useTheme() {
  // Inicia o tema com o valor do localStorage ou 'light' como padrão
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement; 

    root.classList.remove('light', 'dark'); 
    root.classList.add(theme); 
    localStorage.setItem('theme', theme); 
  }, [theme]);

  return [theme, setTheme];
}