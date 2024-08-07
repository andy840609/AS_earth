// import { aaaa } from "./complex.min.js";
// console.debug(aaaa);
// Define the system's zeros and poles
const z = [
  new Complex(0, 0),
  new Complex(0, 0),
  new Complex(-1.08e2, 0),
  new Complex(-1.61e2, 0),
];
const p = [
  new Complex(-1.815e-2, 1.799e-2),
  new Complex(-1.815e-2, -1.799e-2),
  new Complex(-1.73e2, 0),
  new Complex(-1.96e2, 2.31e2),
  new Complex(-1.96e2, -2.31e2),
  new Complex(-7.32e2, 1.451e3),
  new Complex(-7.32e2, -1.451e3),
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
const iw0 = new Complex(0, w0);
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
  const iw = new Complex(0, w);

  let topMultiplier = new Complex(1, 0);
  for (let i = 0; i < nz; i++) {
    topMultiplier = topMultiplier.mul(iw.sub(z[i]));
  }

  let btmMultiplier = new Complex(1, 0);
  for (let i = 0; i < np; i++) {
    btmMultiplier = btmMultiplier.mul(iw.sub(p[i]));
  }

  const resp = topMultiplier.div(btmMultiplier);
  amp[count] = resp.abs();
  phs[count] = Math.atan2(resp.im, resp.re) * rad;

  count++;
}

// Compute the normalization factor at f0
let topMultiplier = new Complex(1, 0);
for (let i = 0; i < nz; i++) {
  topMultiplier = topMultiplier.mul(iw0.sub(z[i]));
}

let btmMultiplier = new Complex(1, 0);
for (let i = 0; i < np; i++) {
  btmMultiplier = btmMultiplier.mul(iw0.sub(p[i]));
}

const resp = topMultiplier.div(btmMultiplier);
const nf = 1 / resp.abs();
console.log("Normalization factor = ", nf);
amp.forEach((value, index, array) => {
  array[index] *= nf;
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
  xaxis: {
    title: "Frequency (Hz)",
    type: "log",
  },
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

// Plotly.newPlot("amplitudeResponse", [trace1], layout1);
// Plotly.newPlot("phaseResponse", [trace2], layout2);

export { frq, amp, phs };
