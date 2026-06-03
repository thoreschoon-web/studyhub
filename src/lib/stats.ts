/* Probability density / mass functions for distribution plots. Pure functions. */

const g = 7;
const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
  1.5056327351493116e-7,
];

export function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = LANCZOS[0];
  for (let i = 1; i < g + 2; i++) x += LANCZOS[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

export function lgamma(z: number): number {
  return Math.log(Math.abs(gamma(z)));
}

function beta(a: number, b: number): number {
  return (gamma(a) * gamma(b)) / gamma(a + b);
}

export function normalPdf(x: number, mu = 0, sigma = 1): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

export function tPdf(x: number, df: number): number {
  const c = gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2));
  return c * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}

export function chi2Pdf(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return (Math.pow(x, k - 1) * Math.exp(-x / 2)) / (Math.pow(2, k) * gamma(k));
}

export function fPdf(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const num = Math.sqrt(Math.pow(d1 * x, d1) * Math.pow(d2, d2) / Math.pow(d1 * x + d2, d1 + d2));
  return num / (x * beta(d1 / 2, d2 / 2));
}

function logFactorial(n: number): number {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}

export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  const logC = logFactorial(n) - logFactorial(k) - logFactorial(n - k);
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

export function poissonPmf(k: number, lambda: number): number {
  if (k < 0) return 0;
  return Math.exp(k * Math.log(lambda) - lambda - logFactorial(k));
}

export type DistKind = "normal" | "t" | "chi2" | "f" | "binomial" | "poisson";

export function isDiscrete(d: DistKind): boolean {
  return d === "binomial" || d === "poisson";
}

/** Suggested x-domain for plotting a distribution. */
export function distDomain(d: DistKind, p: Record<string, number>): [number, number] {
  switch (d) {
    case "normal": {
      const mu = p.mu ?? 0, s = p.sigma ?? 1;
      return [mu - 4 * s, mu + 4 * s];
    }
    case "t":
      return [-4.5, 4.5];
    case "chi2":
      return [0, Math.max(10, (p.df ?? 3) * 3)];
    case "f":
      return [0, 5];
    case "binomial":
      return [0, p.n ?? 10];
    case "poisson":
      return [0, Math.max(10, (p.lambda ?? 4) * 2.5)];
  }
}

export function distPdf(d: DistKind, p: Record<string, number>): (x: number) => number {
  switch (d) {
    case "normal":
      return (x) => normalPdf(x, p.mu ?? 0, p.sigma ?? 1);
    case "t":
      return (x) => tPdf(x, p.df ?? 10);
    case "chi2":
      return (x) => chi2Pdf(x, p.df ?? 3);
    case "f":
      return (x) => fPdf(x, p.d1 ?? 5, p.d2 ?? 10);
    case "binomial":
      return (k) => binomialPmf(Math.round(k), p.n ?? 10, p.p ?? 0.5);
    case "poisson":
      return (k) => poissonPmf(Math.round(k), p.lambda ?? 4);
  }
}
