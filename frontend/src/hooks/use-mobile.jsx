import * as React from "react";

// Define o breakpoint para dispositivos móveis
const MOBILE_BREAKPOINT = 768;

// Hook personalizado para detectar se o usuário está em dispositivo móvel
export function useIsMobile() {
  // Estado que guarda se é mobile ou não
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // Cria um MediaQueryList para acompanhar mudanças de largura
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Função que atualiza o estado com base na largura da janela
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener("change", onChange); // Adiciona listener
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // Estado inicial

    return () => mql.removeEventListener("change", onChange); // Cleanup
  }, []);

  return !!isMobile; // Garante retorno booleano
};
