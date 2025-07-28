import React from 'react';
import Calculator from '../Calculator';
import { calculateMG1 } from '../../utils/queueCalculations';

const MG1: React.FC = () => {
  const inputs = [
    {
      key: 'lambda',
      label: 'Tasa de arribos (λ)*',
      placeholder: 'Ingrese la tasa de arribos',
    },
    {
      key: 'mu',
      label: 'Tasa de servicio promedio (μ)*',
      placeholder: 'Ingrese la tasa de servicio promedio',
    },
    {
      key: 'sigma2',
      label: 'Varianza del tiempo de servicio (σ²)*',
      placeholder: 'Ingrese la varianza del tiempo de servicio',
    },
  ];

  return (
    <Calculator
      title="M/G/1"
      description="El modelo M/G/1 tiene llegadas Poisson pero el tiempo de servicio sigue una distribución general. Este modelo utiliza la fórmula de Pollaczek-Khinchine para calcular las métricas del sistema."
      inputs={inputs}
      onCalculate={calculateMG1}
    />
  );
};

export default MG1;