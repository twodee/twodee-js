class Color {
  constructor() {
    this.values = [255, 255, 255, 0];
  }

  equals(that) {
    return this.values[0] == that.values[0] &&
           this.values[1] == that.values[1] &&
           this.values[2] == that.values[2] &&
           this.values[3] == that.values[3];
  }

  set r(value) {
    this.values[0] = value;
  }

  set g(value) {
    this.values[1] = value;
  }

  set b(value) {
    this.values[2] = value;
  }

  set a(value) {
    this.values[3] = value;
  }

  get r() {
    return this.values[0];
  }

  get g() {
    return this.values[1];
  }

  get b() {
    return this.values[2];
  }

  get a() {
    return this.values[3];
  }

  // https://gist.github.com/mjackson/5311256
  toHsv() {
    let rr = this.r / 255;
    let gg = this.g / 255;
    let bb = this.b / 255;

    let max = Math.max(rr, gg, bb);
    let min = Math.min(rr, gg, bb);
    let h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break;
        case gg: h = (bb - rr) / d + 2; break;
        case bb: h = (rr - gg) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, v];
  }

  clone() {
    let newColor = new Color();
    newColor.r = this.r;
    newColor.g = this.g;
    newColor.b = this.b;
    newColor.a = this.a;
    return newColor;
  }

  toString() {
    return `[${this.r} ${this.g} ${this.b} ${this.a}]`;
  }

  toJSON() {
    return this.values;
  }

  static fromBytes(r, g, b, a) {
    let color = new Color();
    color.values[0] = r; 
    color.values[1] = g; 
    color.values[2] = b; 
    color.values[3] = a; 
    return color;
  }

  static fromByteArray(rgba) {
    let color = new Color();
    color.values[0] = rgba[0]; 
    color.values[1] = rgba[1]; 
    color.values[2] = rgba[2]; 
    color.values[3] = rgba[3]; 
    return color;
  }
}
