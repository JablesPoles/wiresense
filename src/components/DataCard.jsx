import PropTypes from 'prop-types';

export function DataCard({ title, value, unit, cost, currencySymbol }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="flex items-baseline gap-2 mt-2">
        <p className="text-3xl font-bold">
          {value}
        </p>
        <span className="text-xl text-gray-300">{unit}</span>
      </div>
      
      {cost && currencySymbol && (
        <p className="text-green-400 text-md font-semibold mt-1">
          {currencySymbol} {cost}
        </p>
      )}
    </div>
  );
}

DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  unit: PropTypes.string.isRequired,
  cost: PropTypes.string,
  currencySymbol: PropTypes.string,
};