import PropTypes from 'prop-types';

export function DataCard({ title, value, unit }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="mt-2 text-3xl font-bold">
        {value} <span className="text-xl text-gray-300">{unit}</span>
      </p>
    </div>
  );
}

// 2. Defina os tipos esperados para as props
DataCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  unit: PropTypes.string.isRequired
};