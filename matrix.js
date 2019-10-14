class Matrix4 {
  constructor() {
    this.buffer = new ArrayBuffer(16 * 4);
    this.floats = new Float32Array(this.buffer);
    this.set(0, 0, 1);
    this.set(1, 1, 1);
    this.set(2, 2, 1);
    this.set(3, 3, 1);
  }

  get(r, c) {
    return this.floats[c * 4 + r];
  }

  set(r, c, value) {
    this.floats[c * 4 + r] = value;
    return this;
  }

  toString() {
    let s = '';
    for (let r = 0; r < 4; ++r) {
      for (let c = 0; c < 4; ++c) {
        let value = this.get(r, c);
        value = Math.round(value * 1000) / 1000
        s += value + ' ';
      }
      s += '\n';
    }
    return s;
  }

  toBuffer() {
    return this.floats;
  }

  multiplyMatrix(that) {
    let product = new Matrix4()
    for (let r = 0; r < 4; ++r) {
      for (let c = 0; c < 4; ++c) {
        let dot = 0;
        for (let i = 0; i < 4; ++i) {
          dot += this.get(r, i) * that.get(i, c);
        }
        product.set(r, c, dot);
      }
    }
    return product;
  }

  multiplyVector(v) {
    let product = [0, 0, 0, 0];
    for (let r = 0; r < 4; ++r) {
      for (let c = 0; c < 4; ++c) {
        product[r] += this.get(r, c) * v[c];
      }
    }
    return product;
  }

  inverse() {
    let m = new Matrix4();

    let a0 = this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0);
    let a1 = this.get(0, 0) * this.get(1, 2) - this.get(0, 2) * this.get(1, 0);
    let a2 = this.get(0, 0) * this.get(1, 3) - this.get(0, 3) * this.get(1, 0);

    let a3 = this.get(0, 1) * this.get(1, 2) - this.get(0, 2) * this.get(1, 1);
    let a4 = this.get(0, 1) * this.get(1, 3) - this.get(0, 3) * this.get(1, 1);
    let a5 = this.get(0, 2) * this.get(1, 3) - this.get(0, 3) * this.get(1, 2);

    let b0 = this.get(2, 0) * this.get(3, 1) - this.get(2, 1) * this.get(3, 0);
    let b1 = this.get(2, 0) * this.get(3, 2) - this.get(2, 2) * this.get(3, 0);
    let b2 = this.get(2, 0) * this.get(3, 3) - this.get(2, 3) * this.get(3, 0);

    let b3 = this.get(2, 1) * this.get(3, 2) - this.get(2, 2) * this.get(3, 1);
    let b4 = this.get(2, 1) * this.get(3, 3) - this.get(2, 3) * this.get(3, 1);
    let b5 = this.get(2, 2) * this.get(3, 3) - this.get(2, 3) * this.get(3, 2);

    let determinant = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

    if (determinant != 0) {
      let inverseDeterminant = 1 / determinant;
      m.set(0, 0, (+this.get(1, 1) * b5 - this.get(1, 2) * b4 + this.get(1, 3) * b3) * inverseDeterminant);
      m.set(0, 1, (-this.get(0, 1) * b5 + this.get(0, 2) * b4 - this.get(0, 3) * b3) * inverseDeterminant);
      m.set(0, 2, (+this.get(3, 1) * a5 - this.get(3, 2) * a4 + this.get(3, 3) * a3) * inverseDeterminant);
      m.set(0, 3, (-this.get(2, 1) * a5 + this.get(2, 2) * a4 - this.get(2, 3) * a3) * inverseDeterminant);
      m.set(1, 0, (-this.get(1, 0) * b5 + this.get(1, 2) * b2 - this.get(1, 3) * b1) * inverseDeterminant);
      m.set(1, 1, (+this.get(0, 0) * b5 - this.get(0, 2) * b2 + this.get(0, 3) * b1) * inverseDeterminant);
      m.set(1, 2, (-this.get(3, 0) * a5 + this.get(3, 2) * a2 - this.get(3, 3) * a1) * inverseDeterminant);
      m.set(1, 3, (+this.get(2, 0) * a5 - this.get(2, 2) * a2 + this.get(2, 3) * a1) * inverseDeterminant);
      m.set(2, 0, (+this.get(1, 0) * b4 - this.get(1, 1) * b2 + this.get(1, 3) * b0) * inverseDeterminant);
      m.set(2, 1, (-this.get(0, 0) * b4 + this.get(0, 1) * b2 - this.get(0, 3) * b0) * inverseDeterminant);
      m.set(2, 2, (+this.get(3, 0) * a4 - this.get(3, 1) * a2 + this.get(3, 3) * a0) * inverseDeterminant);
      m.set(2, 3, (-this.get(2, 0) * a4 + this.get(2, 1) * a2 - this.get(2, 3) * a0) * inverseDeterminant);
      m.set(3, 0, (-this.get(1, 0) * b3 + this.get(1, 1) * b1 - this.get(1, 2) * b0) * inverseDeterminant);
      m.set(3, 1, (+this.get(0, 0) * b3 - this.get(0, 1) * b1 + this.get(0, 2) * b0) * inverseDeterminant);
      m.set(3, 2, (-this.get(3, 0) * a3 + this.get(3, 1) * a1 - this.get(3, 2) * a0) * inverseDeterminant);
      m.set(3, 3, (+this.get(2, 0) * a3 - this.get(2, 1) * a1 + this.get(2, 2) * a0) * inverseDeterminant);
    } else {
      throw 'singularity';
    }

    return m;
  }

  toString() {
    let s = '';
    for (let r = 0; r < 4; ++r) {
      for (let c = 0; c < 4; ++c) {
        s += this.get(r, c) + ', ';
      }
      s += '\n';
    }
    return s;
  }

  static ortho(left, right, bottom, top, near = -1, far = 1) {
    let m = new Matrix4();
    m.set(0, 0, 2 / (right - left));
    m.set(1, 1, 2 / (top - bottom));
    m.set(2, 2, 2 / (near - far));
    m.set(0, 3, -(right + left) / (right - left));
    m.set(1, 3, -(top + bottom) / (top - bottom));
    m.set(2, 3, (near + far) / (near - far));
    return m;
  }

  static inverseOrtho(left, right, bottom, top, near = -1, far = 1) {
    let m = Matrix4.scale((right - left) * 0.5, (top - bottom) * 0.5, (near - far) * 0.5);
    m.set(0, 3, (right + left) * 0.5);
    m.set(1, 3, (top + bottom) * 0.5);
    m.set(2, 3, (far + near) * 0.5);
    return m;
  }

  static scale(x, y, z) {
    let m = new Matrix4();
    m.set(0, 0, x);
    m.set(1, 1, y);
    m.set(2, 2, z);
    return m;
  }

  static translate(x, y, z) {
    let m = new Matrix4();
    m.set(0, 3, x);
    m.set(1, 3, y);
    m.set(2, 3, z);
    return m;
  }
}
