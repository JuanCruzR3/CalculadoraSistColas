import React from 'react';
import Calculator from '../Calculator';
import { calculateMD1 } from '../../utils/queueCalculations';

const MD1: React.FC = () => {
  const inputs = [
    {
      key: 'lambda',
      label: 'Tasa de arribos (λ)*',
      placeholder: 'Ingrese la tasa de arribos',
    },
    {
      key: 'mu',
      label: 'Tasa de servicio (μ)*',
      placeholder: 'Ingrese la tasa de servicio',
    },
  ];

  return (
    <Calculator
      title="M/D/1"
      description="El modelo M/D/1 tiene llegadas Poisson y tiempo de servicio determinístico (constante). Este es un caso especial del modelo M/G/1 donde la varianza del tiempo de servicio es cero."
      inputs={inputs}
      onCalculate={calculateMD1}
    />
  );
};

export default MD1;