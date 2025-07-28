import React, { useState } from 'react';
import { QueueResults } from '../types';

interface CalculatorProps {
  title: string;
  description: string;
  inputs: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: string;
  }>;
  onCalculate: (inputs: any) => QueueResults;
}

const Calculator: React.FC<CalculatorProps> = ({
  title,
  description,
  inputs,
  onCalculate,
}) => {
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<QueueResults | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const handleCalculate = () => {
    try {
      const numericInputs: { [key: string]: number } = {};
      
      for (const input of inputs) {
        const value = parseFloat(inputValues[input.key] || '0');
        if (isNaN(value) || value <= 0) {
          throw new Error(`Por favor ingrese un valor válido para ${input.label}`);
        }
        numericInputs[input.key] = value;
      }

      const calculatedResults = onCalculate(numericInputs);
      setResults(calculatedResults);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el cálculo');
      setResults(null);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toFixed(6);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:ml-64">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Información del modelo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Formulario de cálculo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {inputs.map((input) => (
              <div key={input.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {input.label}
                </label>
                <input
                  type={input.type || 'number'}
                  step="any"
                  min="0"
                  placeholder={input.placeholder}
                  value={inputValues[input.key] || ''}
                  onChange={(e) => handleInputChange(input.key, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-teal-500 focus:border-teal-500 
                           dark:bg-gray-700 dark:text-white placeholder-gray-500 
                           transition-colors duration-200"
                />
              </div>
            ))}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleCalculate}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 
                       transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Calcular
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {results && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Resultados
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(results).map(([key, value]) => {
              if (typeof value === 'function') return null;
              
              const labels: { [key: string]: string } = {
                rho: 'Factor de utilización (ρ)',
                P0: 'Probabilidad de sistema vacío (P₀)',
                L: 'Número promedio de clientes en el sistema (L)',
                Lq: 'Número promedio de clientes en cola (Lq)',
                W: 'Tiempo promedio en el sistema (W)',
                Wq: 'Tiempo promedio en cola (Wq)',
                lambdaEff: 'Tasa efectiva de llegadas (λₑ)',
              };

              return (
                <div
                  key={key}
                  className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 
                           p-4 rounded-lg border border-teal-200 dark:border-gray-500"
                >
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {labels[key] || key}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(value as number)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;