import * as React from "react"
import { motion } from "framer-motion"

const Switch = ({ checked, onCheckedChange, disabled = false }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={`
        w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked ? 'bg-primary' : 'bg-input'}
      `}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="bg-white w-4 h-4 rounded-full shadow-sm"
                animate={{
                    x: checked ? 24 : 0
                }}
            />
        </button>
    )
}

export { Switch }
