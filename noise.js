import {Vector2} from './vector';

export class Noise {
  static perlinNoise(p) {
    let floorP = p.floor();
    const fractionP = p.subtract(floorP);
    floorP = floorP.scalarAnd(255); 
    const u = this.fade(fractionP.x);
    const v = this.fade(fractionP.y);
    const w = this.fade(fractionP.z);

    const inc = x => x + 1;

    const pp = this.permutations;
    const aaa = pp[pp[pp[floorP.x] + floorP.y] + floorP.z];
    const aba = pp[pp[pp[floorP.x] + inc(floorP.y)] + floorP.z];
    const aab = pp[pp[pp[floorP.x] + floorP.y] + inc(floorP.z)];
    const abb = pp[pp[pp[floorP.x] + inc(floorP.y)] + inc(floorP.z)];
    const baa = pp[pp[pp[inc(floorP.x)] + floorP.y] + floorP.z];
    const bba = pp[pp[pp[inc(floorP.x)] + inc(floorP.y)] + floorP.z];
    const bab = pp[pp[pp[inc(floorP.x)] + floorP.y] + inc(floorP.z)];
    const bbb = pp[pp[pp[inc(floorP.x)] + inc(floorP.y)] + inc(floorP.z)];

    let dotAAA = this.grad(aaa, fractionP.x, fractionP.y, fractionP.z);
    let dotBAA = this.grad(baa, fractionP.x - 1, fractionP.y, fractionP.z);
    let dotABA = this.grad(aba, fractionP.x, fractionP.y - 1, fractionP.z);
    let dotBBA = this.grad(bba, fractionP.x - 1, fractionP.y - 1, fractionP.z);
    let dotAAB = this.grad(aab, fractionP.x, fractionP.y, fractionP.z - 1);
    let dotBAB = this.grad(bab, fractionP.x - 1, fractionP.y, fractionP.z - 1);
    let dotABB = this.grad(abb, fractionP.x, fractionP.y - 1, fractionP.z - 1);
    let dotBBB = this.grad(bbb, fractionP.x - 1, fractionP.y - 1, fractionP.z - 1);

    const lerp = (a, b, t) => a + t * (b - a);

    const a = lerp(dotAAA, dotBAA, u);
    const b = lerp(dotABA, dotBBA, u);
    const c = lerp(dotAAB, dotBAB, u);
    const d = lerp(dotABB, dotBBB, u);

    const e = lerp(a, b, v);
    const f = lerp(c, d, v);

    const g = lerp(e, f, w);

    return g;
  }

  static fractalPerlinNoise(p, layerCount) {
    let sum = 0;
    let frequency = 1;
    for (let i = 0; i < layerCount; i += 1) {
      const weight = (1 << i) / ((1 << layerCount) - 1);
      sum += this.perlinNoise(p.scalarMultiply(frequency)) * weight;
      frequency *= 0.5;
    }
    return sum;// * 0.5 + 0.5;
  }

  static grad(hash, x, y, z) {
    switch(hash & 0xF) {
      case 0x0: return  x + y;
      case 0x1: return -x + y;
      case 0x2: return  x - y;
      case 0x3: return -x - y;
      case 0x4: return  x + z;
      case 0x5: return -x + z;
      case 0x6: return  x - z;
      case 0x7: return -x - z;
      case 0x8: return  y + z;
      case 0x9: return -y + z;
      case 0xA: return  y - z;
      case 0xB: return -y - z;
      case 0xC: return  y + x;
      case 0xD: return -y + z;
      case 0xE: return  y - x;
      case 0xF: return -y - z;
      default: return 0; // never happens
    }
  }

  static randomGradients2(width, height) {
    const gradients = new Array(height);
    for (let r = 0; r < height; ++r) {
      gradients[r] = new Array(width);
      for (let c = 0; c < width; ++c) {
        const radians = Math.random() * 2 * Math.PI;
        gradients[r][c] = new Vector2(Math.cos(radians), Math.sin(radians));
      }
    }
    return gradients;
  }

  static fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  static slowPerlin2(p) {
    if (!this.gradients2) {
      this.gradients2 = this.randomGradients2(256, 256);
    }

    const base = p.floor();
    const apex = base.scalarAdd(1).scalarMod(256);
    const fraction = p.subtract(base);

    const xyGradient = this.gradients2[base.y][base.x];
    const XyGradient = this.gradients2[base.y][apex.x];
    const xYGradient = this.gradients2[apex.y][base.x];
    const XYGradient = this.gradients2[apex.y][apex.x];

    const xyDot = p.subtract(new Vector2(base.x, base.y)).dot(xyGradient);
    const XyDot = p.subtract(new Vector2(apex.x, base.y)).dot(XyGradient);
    const xYDot = p.subtract(new Vector2(base.x, apex.y)).dot(xYGradient);
    const XYDot = p.subtract(new Vector2(apex.x, apex.y)).dot(XYGradient);

    const lerp = (a, b, t) => a + t * (b - a);

    const below = lerp(xyDot, XyDot, this.fade(fraction.x));
    const above = lerp(xYDot, XYDot, this.fade(fraction.x));
    const value = lerp(below, above, this.fade(fraction.y));

    return value;
  }

  static slowFractalPerlin2(p, layerCount) {
    let sum = 0;
    for (let i = 0; i < layerCount; i += 1) {
      const weight = (1 << i) / ((1 << layerCount) - 1);
      sum += this.slowPerlin2(p.scalarMultiply(1 / (1 << i))) * weight;
    }
    return sum;
  }
}

Noise.permutations = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
for (let i = 0; i < 256; ++i) {
  Noise.permutations[i + 256] = Noise.permutations[i];
}

/*
  static fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  static randomGradients2(width, height) {
    const gradients = new Array(height);
    for (let r = 0; r < height; ++r) {
      gradients[r] = new Array(width);
      for (let c = 0; c < width; ++c) {
        const radians = Math.random() * 2 * Math.PI;
        gradients[r][c] = new Vector2(Math.cos(radians), Math.sin(radians));
      }
    }
    return gradients;
  }

  static slowPerlin2(p) {
    if (!this.gradients2) {
      this.gradients2 = this.randomGradients2(256, 256);
    }

    const base = p.floor();
    const apex = base.scalarAdd(1).scalarMod(256);
    const fraction = p.subtract(base);

    const xyGradient = this.gradients2[base.y][base.x];
    const XyGradient = this.gradients2[base.y][apex.x];
    const xYGradient = this.gradients2[apex.y][base.x];
    const XYGradient = this.gradients2[apex.y][apex.x];

    const xyDot = p.subtract(new Vector2(base.x, base.y)).dot(xyGradient);
    const XyDot = p.subtract(new Vector2(apex.x, base.y)).dot(XyGradient);
    const xYDot = p.subtract(new Vector2(base.x, apex.y)).dot(xYGradient);
    const XYDot = p.subtract(new Vector2(apex.x, apex.y)).dot(XYGradient);

    const lerp = (a, b, t) => a + t * (b - a);
    // const fade = t => t;
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);

    const below = lerp(xyDot, XyDot, fade(fraction.x));
    const above = lerp(xYDot, XYDot, fade(fraction.x));
    const value = lerp(below, above, fade(fraction.y));

    return value;
  }

  static slowFractalPerlin2(p, layerCount) {
    let sum = 0;
    for (let i = 0; i < layerCount; i += 1) {
      const weight = (1 << i) / ((1 << layerCount) - 1);
      sum += this.slowPerlin2(p.scalarMultiply(1 / (1 << i))) * weight;
    }
    return sum;
  }
  */
