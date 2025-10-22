import { useState } from 'react';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  SignalIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

/**
 * Sidebar lateral da aplicação com opção de recolher/expandir
 */
const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Alterna entre expandido e recolhido
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`flex flex-col bg-gray-800 text-gray-100 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Cabeçalho da Sidebar */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700 shrink-0">
        <div className={`text-2xl font-bold ${isCollapsed ? 'hidden' : 'block'}`}>
          EnergyDash
        </div>
        <SignalIcon className={`h-8 w-8 ${isCollapsed ? 'block' : 'hidden'}`} />
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <a href="#" className="flex items-center p-2 space-x-3 rounded-md bg-blue-600 text-white">
          <HomeIcon className="h-6 w-6" />
          <span className={isCollapsed ? 'hidden' : ''}>Dashboard</span>
        </a>
        <a href="#" className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700">
          <ChartBarIcon className="h-6 w-6" />
          <span className={isCollapsed ? 'hidden' : ''}>Relatórios</span>
        </a>
        <a href="#" className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700">
          <Cog6ToothIcon className="h-6 w-6" />
          <span className={isCollapsed ? 'hidden' : ''}>Configurações</span>
        </a>
      </nav>

      {/* Rodapé com status e botão de recolher */}
      <div className="px-4 py-6 border-t border-gray-700 space-y-4 shrink-0">
        {/* Indicador de status online */}
        <div className="flex items-center p-2 space-x-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className={isCollapsed ? 'hidden' : ''}>Monitor Online</span>
        </div>

        {/* Botão de recolher/expandir Sidebar */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-6 w-6" />
          ) : (
            <ChevronDoubleLeftIcon className="h-6 w-6" />
          )}
          <span className={isCollapsed ? 'hidden' : ''}>Recolher</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
