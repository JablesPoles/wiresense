import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export const DataCard = ({ title, value, unit, cost, currencySymbol }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden bg-card border border-border p-6 rounded-xl shadow-lg group"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 break-words">
          {title}
        </h3>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {value}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-primary">{unit}</span>
        </div>

        {cost && (
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Custo Estimado</span>
            <span className="text-sm font-mono font-medium text-green-400">
              {currencySymbol} {cost}
            </span>
          </div>
        )}
      </div>

      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </motion.div>
  );
};

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
