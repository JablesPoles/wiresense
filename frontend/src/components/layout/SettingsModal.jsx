import { useSettings } from '../../contexts/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion'; 
import { X, SlidersHorizontal, DollarSign, Globe } from 'lucide-react'; 
import { VoltageSelector } from './VoltageSelector';

/**
 * Modal de configurações da aplicação
 */
export const SettingsModal = () => {
  const { 
    isSettingsOpen, setIsSettingsOpen, 
    voltage, updateVoltage,
    tarifaKwh, updateTarifaKwh,
    moeda, updateMoeda
  } = useSettings();

  // Lista de moedas disponíveis
  const moedas = {
    'BRL': 'Real (R$)',
    'USD': 'Dólar ($)',
    'EUR': 'Euro (€)',
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full relative"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            {/* Botão de fechar */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Cabeçalho do modal */}
            <div className="flex items-center gap-3 mb-6">
              <SlidersHorizontal className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h2>
            </div>

            {/* Seletor de tensão */}
            <VoltageSelector 
              selectedVoltage={voltage}
              onVoltageChange={updateVoltage}
            />

            <hr className="my-6 border-gray-500/30" />

            {/* Configurações adicionais */}
            <div className="space-y-4">
              {/* Tarifa por kWh */}
              <div>
                <label htmlFor="tarifa-kwh" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <DollarSign size={16}/> Custo da Tarifa por kWh
                </label>
                <input 
                  id="tarifa-kwh"
                  type="number"
                  step="0.01"
                  value={tarifaKwh}
                  onChange={(e) => updateTarifaKwh(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
                  placeholder="Ex: 0.92"
                />
              </div>

              {/* Moeda */}
              <div>
                <label htmlFor="moeda" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                   <Globe size={16}/> Moeda
                </label>
                <select 
                  id="moeda"
                  value={moeda}
                  onChange={(e) => updateMoeda(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
                >
                  {Object.entries(moedas).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};