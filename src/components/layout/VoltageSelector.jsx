import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const VoltageSelector = ({ selectedVoltage, onVoltageChange }) => {
  const standardVoltages = [110, 127, 220];
  const isCustom = !standardVoltages.includes(selectedVoltage);

  // Estados locais APENAS para controlar a interface (UI)
  const [selectorValue, setSelectorValue] = useState(isCustom ? 'custom' : selectedVoltage);
  const [customValue, setCustomValue] = useState(isCustom ? selectedVoltage : '');

  // Sincroniza a UI se o valor mudar externamente (pelo context)
  useEffect(() => {
    const isNowCustom = !standardVoltages.includes(selectedVoltage);
    if (isNowCustom) {
      setSelectorValue('custom');
      setCustomValue(selectedVoltage);
    } else {
      setSelectorValue(selectedVoltage);
    }
  }, [selectedVoltage]);

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectorValue(value);
    if (value !== 'custom') {
      onVoltageChange(Number(value));
    }
  };

  const handleCustomInputChange = (e) => {
    const value = e.target.value;
    setCustomValue(value);
    onVoltageChange(Number(value));
  };

  return (
    <div>
      <label htmlFor="voltage-selector" className="block text-sm font-medium text-gray-400 mb-2">
        Selecione a Voltagem da Rede
      </label>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <select
          id="voltage-selector"
          value={selectorValue}
          onChange={handleSelectChange}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-1/2 p-2.5"
        >
          {standardVoltages.map((v) => (
            <option key={v} value={v}>{v}V</option>
          ))}
          <option value="custom">Customizada...</option>
        </select>

        {selectorValue === 'custom' && (
          <input
            type="number"
            value={customValue}
            onChange={handleCustomInputChange}
            placeholder="Digite a voltagem"
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-1/2 p-2.5"
            autoFocus
          />
        )}
      </div>
    </div>
  );
};

VoltageSelector.propTypes = {
  selectedVoltage: PropTypes.number.isRequired,
  onVoltageChange: PropTypes.func.isRequired,
};