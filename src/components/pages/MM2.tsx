import React from 'react';
import Calculator from '../Calculator';
import { calculateMM2 } from '../../utils/queueCalculations';

const MM2: React.FC = () => {
  const inputs = [
    {
      key: 'lambda',
      label: 'Tasa de arribos (λ)*',
      placeholder: 'Ingrese la tasa de arribos',
    },
    {
      key: 'mu',
      label: 'Tiempo de servicio por servidor (μ)*',
      placeholder: 'Ingrese el tiempo de servicio',
    },
  ];

  return (
    <Calculator
      title="M/M/2"
      description="El modelo M/M/2 es un sistema con dos servidores en paralelo. Los clientes llegan según un proceso de Poisson y el tiempo de servicio de cada servidor sigue una distribución exponencial."
      inputs={inputs}
      onCalculate={calculateMM2}
    />
  );
};

export default MM2;