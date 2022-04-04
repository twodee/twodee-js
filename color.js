export class Color {
  constructor(r, g, b) {
    this.values = [r, g, b];
  }

  static rgb(r, g, b) {
    return new Color(r, g, b);
  }

  static gray(intensity) {
    return new Color(intensity, intensity, intensity);
  }

  equals(that) {
    return this.values[0] == that.values[0] &&
           this.values[1] == that.values[1] &&
           this.values[2] == that.values[2];
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

  get r() {
    return this.values[0];
  }

  get g() {
    return this.values[1];
  }

  get b() {
    return this.values[2];
  }

  // https://gist.github.com/mjackson/5311256
  toHsv() {
    let rr = this.r;
    let gg = this.g;
    let bb = this.b;

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
    return newColor;
  }

  toString() {
    return `[${this.r} ${this.g} ${this.b}]`;
  }

  toJSON() {
    return this.values;
  }

  toHex() {
    const r = Math.round(this.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(this.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(this.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  toArray() {
    return this.values;
  }

  static parseHex(hex) {
    return new Color(
      parseInt(hex.substring(1, 3), 16) / 255,
      parseInt(hex.substring(3, 5), 16) / 255,
      parseInt(hex.substring(5, 7), 16) / 255
    );
  }

  static fromBytes(r, g, b) {
    let color = new Color();
    color.values[0] = r / 255; 
    color.values[1] = g / 255; 
    color.values[2] = b / 255; 
    return color;
  }

  static fromByteArray(rgb) {
    let color = new Color();
    color.values[0] = rgba[0] / 255; 
    color.values[1] = rgba[1] / 255; 
    color.values[2] = rgba[2] / 255; 
    return color;
  }
}

export class ColorAlpha {
  constructor(r, g, b, a) {
    this.values = [r, g, b, a];
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
    let rr = this.r;
    let gg = this.g;
    let bb = this.b;

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

  toHex() {
    const r = Math.round(this.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(this.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(this.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  toArray() {
    return this.values;
  }

  static parseHex(hex) {
    return new Color(
      parseInt(hex.substring(1, 3), 16) / 255,
      parseInt(hex.substring(3, 5), 16) / 255,
      parseInt(hex.substring(5, 7), 16) / 255,
      1
    );
  }

  static fromBytes(r, g, b, a) {
    let color = new Color();
    color.values[0] = r / 255; 
    color.values[1] = g / 255; 
    color.values[2] = b / 255; 
    color.values[3] = a / 255; 
    return color;
  }

  static fromByteArray(rgba) {
    let color = new Color();
    color.values[0] = rgba[0] / 255; 
    color.values[1] = rgba[1] / 255; 
    color.values[2] = rgba[2] / 255; 
    color.values[3] = rgba[3] / 255; 
    return color;
  }
}
