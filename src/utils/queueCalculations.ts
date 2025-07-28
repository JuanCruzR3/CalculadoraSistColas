import { QueueResults, MM1Inputs, MM2Inputs, MM1NInputs, MG1Inputs, MD1Inputs } from '../types';

export const calculateMM1 = ({ lambda, mu }: MM1Inputs): QueueResults => {
  if (lambda >= mu) {
    throw new Error('El sistema es inestable: λ debe ser menor que μ');
  }

  const rho = lambda / mu;
  const P0 = 1 - rho;
  const L = rho / (1 - rho);
  const Lq = (rho * rho) / (1 - rho);
  const W = 1 / (mu - lambda);
  const Wq = rho / (mu - lambda);

  const Pn = (n: number): number => {
    return P0 * Math.pow(rho, n);
  };

  return { rho, P0, L, Lq, W, Wq, Pn };
};

export const calculateMM2 = ({ lambda, mu }: MM2Inputs): QueueResults => {
  if (lambda >= 2 * mu) {
    throw new Error('El sistema es inestable: λ debe ser menor que 2μ');
  }

  const rho = lambda / mu;
  const P0 = 1 / (1 + rho + (rho * rho) / (2 - rho));
  const P1 = rho * P0;
  const P2 = (rho * rho * P0) / 2;
  
  const Lq = (rho * rho * rho * P0) / (2 * (2 - rho) * (2 - rho));
  const L = Lq + rho;
  const Wq = Lq / lambda;
  const W = L / lambda;

  const Pn = (n: number): number => {
    if (n === 0) return P0;
    if (n === 1) return P1;
    if (n >= 2) {
      return (Math.pow(rho, n) * P0) / (Math.pow(2, n - 1));
    }
    return 0;
  };

  return { rho, P0, L, Lq, W, Wq, Pn };
};

export const calculateMM1N = ({ lambda, mu, N }: MM1NInputs): QueueResults => {
  const rho = lambda / mu;
  
  let P0: number;
  if (rho === 1) {
    P0 = 1 / (N + 1);
  } else {
    P0 = (1 - rho) / (1 - Math.pow(rho, N + 1));
  }

  const lambdaEff = lambda * (1 - Math.pow(rho, N) * P0);
  
  let L: number;
  if (rho === 1) {
    L = N / 2;
  } else {
    L = (rho * (1 - (N + 1) * Math.pow(rho, N) + N * Math.pow(rho, N + 1))) / 
        ((1 - rho) * (1 - Math.pow(rho, N + 1)));
  }

  const Lq = L - (lambdaEff / mu);
  const W = L / lambdaEff;
  const Wq = Lq / lambdaEff;

  const Pn = (n: number): number => {
    if (n < 0 || n > N) return 0;
    return P0 * Math.pow(rho, n);
  };

  return { rho, P0, L, Lq, W, Wq, Pn, lambdaEff };
};

export const calculateMG1 = ({ lambda, mu, sigma2 }: MG1Inputs): QueueResults => {
  if (lambda >= mu) {
    throw new Error('El sistema es inestable: λ debe ser menor que μ');
  }

  const rho = lambda / mu;
  const P0 = 1 - rho;
  
  // Fórmula de Pollaczek-Khinchine
  const Lq = (lambda * lambda * sigma2 + rho * rho) / (2 * (1 - rho));
  const L = Lq + rho;
  const Wq = Lq / lambda;
  const W = L / lambda;

  return { rho, P0, L, Lq, W, Wq };
};

export const calculateMD1 = ({ lambda, mu }: MD1Inputs): QueueResults => {
  if (lambda >= mu) {
    throw new Error('El sistema es inestable: λ debe ser menor que μ');
  }

  const rho = lambda / mu;
  const P0 = 1 - rho;
  
  // Para M/D/1, σ² = 0 (servicio determinístico)
  const Lq = (rho * rho) / (2 * (1 - rho));
  const L = Lq + rho;
  const Wq = Lq / lambda;
  const W = L / lambda;

  return { rho, P0, L, Lq, W, Wq };
};