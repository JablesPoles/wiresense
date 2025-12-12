import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui/button';

export const CSVExportButton = ({ data, filename = 'export.csv', className }) => {

    const handleExport = () => {
        if (!data || data.length === 0) {
            alert("Sem dados para exportar.");
            return;
        }

        // 1. Get headers
        const headers = Object.keys(data[0]);

        // 2. Convert to CSV string
        const csvContent = [
            headers.join(','), // Header row
            ...data.map(row => headers.map(fieldName => {
                // Handle strings with commas, nulls, etc.
                const val = row[fieldName];
                return JSON.stringify(val ?? '');
            }).join(','))
        ].join('\n');

        // 3. Create Blob and Link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className={`flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 ${className}`}
        >
            <Download size={14} />
            Exportar CSV
        </button>
    );
};
