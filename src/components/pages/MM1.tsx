import React from 'react';
import Calculator from '../Calculator';
import { calculateMM1 } from '../../utils/queueCalculations';

const MM1: React.FC = () => {
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
  ];

  return (
    <Calculator
      title="M/M/1"
      description="El modelo M/M/1 es un modelo de colas que se caracteriza por tener un solo servidor y una sola fila de espera. La distribución de llegadas y de servicio son de tipo exponencial."
      inputs={inputs}
      onCalculate={calculateMM1}
    />
  );
};

export default MM1;