// Define the system's zeros and poles
const z = [
  Complex(0, 0),
  Complex(0, 0),
  Complex(-1.08e2, 0),
  Complex(-1.61e2, 0),
];
const p = [
  Complex(-1.815e-2, 1.799e-2),
  Complex(-1.815e-2, -1.799e-2),
  Complex(-1.73e2, 0),
  Complex(-1.96e2, 2.31e2),
  Complex(-1.96e2, -2.31e2),
  Complex(-7.32e2, 1.451e3),
  Complex(-7.32e2, -1.451e3),
];

// Calculate the number of zeros and poles
const nz = z.length;
const np = p.length;
console.log("NZ = ", nz);
console.log("NP = ", np);

// Define constants and frequency range
const f0 = 1; // Normalization frequency (Hz)
const twopi = 2 * Math.PI;
const w0 = twopi * f0;
const iw0 = Complex(0, w0);
const rad = 180 / Math.PI;

const fq0 = 0.001; // Hz
const fq1 = 1000; // Hz
const ip0 = Math.log10(fq0);
const ip1 = Math.log10(fq1);
const nprd = 201;
const dprd = (ip1 - ip0) / (nprd - 1);

const frq = new Array(nprd).fill(0);
const amp = new Array(nprd).fill(0);
const phs = new Array(nprd).fill(0);

let count = 0;
while (count < nprd) {
  frq[count] = Math.pow(10, ip0 + dprd * count);
  const w = twopi * frq[count];
  const iw = Complex(0, w);

  let topMultiplier = Complex(1, 0);
  for (let i = 0; i < nz; i++) {
    topMultiplier = topMultiplier.multiply(iw.subtract(z[i]));
  }
  const top = topMultiplier;

  let btm = Complex(1, 0);
  for (let i = 0; i < np; i++) {
    btm = btm.multiply(iw.subtract(p[i]));
  }

  const resp = top.divide(btm);
  amp[count] = resp.abs();
  phs[count] = Math.atan2(resp.imag(), resp.real()) * rad;

  count++;
}

// Compute the normalization factor at f0
let top = Complex(1, 0);
for (let i = 0; i < nz; i++) {
  top = top.multiply(iw0.subtract(z[i]));
}

let btm = Complex(1, 0);
for (let i = 0; i < np; i++) {
  btm = btm.multiply(iw0.subtract(p[i]));
}

const normalizationFactor = top.divide(btm).abs();
console.log("Normalization factor = ", normalizationFactor);
amp.forEach((value, index, array) => {
  array[index] *= normalizationFactor;
});

// Plot the frequency response using JavaScript
const trace1 = {
  x: frq,
  y: amp,
  type: "scatter",
  mode: "lines",
  line: {
    color: "red",
    width: 2,
  },
  name: "Amplitude",
};

const layout1 = {
  title: "Amplitude Response",
  yaxis: {
    title: "Normalized Amplitude",
    type: "log",
  },
};

const trace2 = {
  x: frq,
  y: phs,
  type: "scatter",
  mode: "lines",
  line: {
    color: "blue",
    width: 2,
  },
  name: "Phase",
};

const layout2 = {
  title: "Phase Response",
  xaxis: {
    title: "Frequency (Hz)",
    type: "log",
  },
  yaxis: {
    title: "Phase (deg.)",
  },
};

Plotly.newPlot("amplitudeResponse", [trace1], layout1);
Plotly.newPlot("phaseResponse", [trace2], layout2);
