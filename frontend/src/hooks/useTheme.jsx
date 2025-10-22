import { useEffect, useState } from 'react';

// Hook personalizado para controle de tema
export function useTheme() {
  // Inicia o tema com valor do localStorage ou 'light' como padrão
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark'); // Remove classes existentes
    root.classList.add(theme); // Adiciona classe do tema atual
    localStorage.setItem('theme', theme); // Persiste no localStorage
  }, [theme]);

  return [theme, setTheme]; // Retorna estado e setter
}
