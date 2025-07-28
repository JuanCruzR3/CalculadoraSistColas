import React from 'react';
import Calculator from '../Calculator';
import { calculateMM1N } from '../../utils/queueCalculations';

const MM1N: React.FC = () => {
  const inputs = [
    {
      key: 'lambda',
      label: 'Tasa de arribos (λ)*',
      placeholder: 'Ingrese la tasa de arribos',
    },
    {
      key: 'mu',
      label: 'Tiempo de servicio (μ)*',
      placeholder: 'Ingrese el tiempo de servicio',
    },
    {
      key: 'N',
      label: 'Capacidad máxima del sistema (N)*',
      placeholder: 'Ingrese la capacidad máxima',
      type: 'number',
    },
  ];

  return (
    <Calculator
      title="M/M/1/N"
      description="El modelo M/M/1/N es una variación del modelo M/M/1 con capacidad limitada. El sistema puede contener máximo N clientes (incluyendo el que está siendo atendido). Si llega un cliente cuando el sistema está lleno, es rechazado."
      inputs={inputs}
      onCalculate={calculateMM1N}
    />
  );
};

export default MM1N;