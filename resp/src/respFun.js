// Define the system's zeros and poles
// const z = [
//   new Complex(0, 0),
//   new Complex(0, 0),
//   new Complex(-1.08e2, 0),
//   new Complex(-1.61e2, 0),
// ];
// const p = [
//   new Complex(-1.815e-2, 1.799e-2),
//   new Complex(-1.815e-2, -1.799e-2),
//   new Complex(-1.73e2, 0),
//   new Complex(-1.96e2, 2.31e2),
//   new Complex(-1.96e2, -2.31e2),
//   new Complex(-7.32e2, 1.451e3),
//   new Complex(-7.32e2, -1.451e3),
// ];
// const f0 = 1; // Normalization frequency (Hz)

function getResData({ z, p, f0 = 1, instType = 1 }) {
  // TAG:根據instType刪除指定數量的[0,0]
  if (!!instType) {
    // 使用filter方法创建一个新数组，该数组不包含要删除的元素
    z = z.filter((complex) => {
      let isTarget =
        Array.isArray(complex) && complex.reduce((a, b) => a + b) === 0;
      if (isTarget && instType > 0) {
        instType--;
        return false; // 要删除的元素
      }
      return true; // 不需要删除的元素
    });
  }

  // Calculate the number of zeros and poles
  const nz = z.length;
  const np = p.length;
  z = z.map((v) => new Complex(...v));
  p = p.map((v) => new Complex(...v));
  console.log("instType = ", instType);
  console.log("param = ", z, p);
  console.log("NZ = ", nz);
  console.log("NP = ", np);

  // Define constants and frequency range
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

  let data = { frq, amp, phs, nf };
  console.log("data =", data);
  return data;
}
