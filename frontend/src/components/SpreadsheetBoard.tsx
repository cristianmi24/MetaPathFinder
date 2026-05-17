import React, { useState, useEffect } from 'react';
import { Table, Plus, Trash2 } from 'lucide-react';

interface SpreadsheetBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function SpreadsheetBoard({ challengeId, onValidation }: SpreadsheetBoardProps) {
  const [data, setData] = useState<string[][]>([
    ['Concepto', 'Cantidad', 'Valor Unitario', 'Total'],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  ]);

  // Si tiene datos (al menos un campo lleno en las filas posteriores a la cabecera) se valida
  const hasContent = data.slice(1).some(row => row.some(cell => cell.trim() !== ''));

  useEffect(() => {
    onValidation(hasContent);
  }, [hasContent, onValidation]);

  const addRow = () => {
    setData(prev => [...prev, Array(prev[0].length).fill('')]);
  };

  const addCol = () => {
    setData(prev => prev.map(row => [...row, '']));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setData(prev => {
      const newData = [...prev];
      newData[rowIndex] = [...newData[rowIndex]];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-surface-container-lowest">
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
          <Table className="w-5 h-5 text-primary" />
          Hoja de Datos
        </div>
        <div className="flex gap-2">
          <button 
            onClick={addRow}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Fila
          </button>
          <button 
            onClick={addCol}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Columna
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="inline-block min-w-full bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <tbody>
              {data.map((row, rIndex) => (
                <tr key={rIndex} className="border-b border-outline-variant/20 last:border-0">
                  {row.map((cell, cIndex) => (
                    <td key={cIndex} className={`border-r border-outline-variant/20 last:border-0 p-0 ${rIndex === 0 ? 'bg-surface-container-low font-semibold' : ''}`}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rIndex, cIndex, e.target.value)}
                        className={`w-full h-full p-3 focus:outline-none focus:bg-primary/5 transition-colors ${rIndex === 0 ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}
                        placeholder={rIndex === 0 ? `Columna ${cIndex + 1}` : ''}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
