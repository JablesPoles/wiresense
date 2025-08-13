import PropTypes from 'prop-types';

export const VoltageSelector = ({ selectedVoltage, onVoltageChange }) => {
  const voltages = [110, 127, 220];

  return (
    <div className="mb-6">
      <label htmlFor="voltage-selector" className="block text-sm font-medium text-gray-400 mb-2">
        Selecione a Voltagem da Rede
      </label>
      <select
        id="voltage-selector"
        value={selectedVoltage}
        onChange={(e) => onVoltageChange(Number(e.target.value))}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-1/4 p-2.5"
      >
        {voltages.map((v) => (
          <option key={v} value={v}>
            {v}V
          </option>
        ))}
      </select>
    </div>
  );
};

VoltageSelector.propTypes = {
  selectedVoltage: PropTypes.number.isRequired,
  onVoltageChange: PropTypes.func.isRequired,
};