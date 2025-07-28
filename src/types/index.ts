export interface QueueResults {
  rho?: number;
  L?: number;
  Lq?: number;
  W?: number;
  Wq?: number;
  P0?: number;
  Pn?: (n: number) => number;
  [key: string]: any;
}

export interface MM1Inputs {
  lambda: number;
  mu: number;
}

export interface MM2Inputs {
  lambda: number;
  mu: number;
}

export interface MM1NInputs {
  lambda: number;
  mu: number;
  N: number;
}

export interface MG1Inputs {
  lambda: number;
  mu: number;
  sigma2: number;
}

export interface MD1Inputs {
  lambda: number;
  mu: number;
}