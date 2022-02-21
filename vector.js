// --------------------------------------------------------------------------- 

export class VectorN {
  constructor(n, data) {
    this.n = n;
    this.data = data;
  }

  get(i) {
    if (i >= 0 && i < this.n) {
      return this.data[i];
    } else {
      throw Error(`Bad index: ${i}`);
    }
  }

  set(i, value) {
    if (i >= 0 && i < this.n) {
      this.data[i] = value;
    } else {
      throw Error(`Bad index: ${i}`);
    }
  }

  get product() {
    return this.data.reduce((accumulator, datum) => accumulator * datum, 1);
  }

  get sum() {
    return this.data.reduce((accumulator, datum) => accumulator + datum, 0);
  }

  get magnitude() {
    return Math.sqrt(this.data.reduce((accumulator, datum) => accumulator + datum * datum, 0));
  }

  normalize() {
    return this.scalarDivide(this.magnitude);
  }

  fit(length) {
    return this.normalize().scalarMultiply(length);
  }

  flipAround(that) {
    return this.subtract(that).inverse().add(that);
  }

  negate() {
    return this.scalarMultiply(-1);
  }

  inverse() {
    return this.scalarMultiply(-1);
  }

  distance(that) {
    return this.subtract(that).magnitude;
  }

  divide(that) {
    return new this.constructor(...this.data.map((value, i) => value / that.get(i)));
  }

  multiply(that) {
    return new this.constructor(...this.data.map((value, i) => value * that.get(i)));
  }

  mod(that) {
    return new this.constructor(...this.data.map((value, i) => value % that.get(i)));
  }

  scalarMod(divisor) {
    return new this.constructor(...this.data.map((value, i) => value % divisor));
  }

  scalarSubtract(x) {
    return new this.constructor(...this.data.map(value => value - x));
  }

  scalarAdd(x) {
    return new this.constructor(...this.data.map(value => value + x));
  }

  scalarAnd(x) {
    return new this.constructor(...this.data.map(value => value & x));
  }

  scalarMultiply(x) {
    return new this.constructor(...this.data.map(value => value * x));
  }

  scalarDivide(x) {
    return new this.constructor(...this.data.map(value => value / x));
  }

  diagonalDistance(that) {
    let diff = that.subtract(this);
    return diff.reduce((a, b) => Math.max(a, b));
  }

  toString() {
    return `[${this.data.join(', ')}]`;
  }

  clone() {
    return new this.constructor(...this.data);
  }

  perpendicular() {
    /*
    This function takes the given vector and finds an arbitrary vector
    perpendicular to it. The premise is as follows:
     
    We need dot(vec, ans) == 0 for perpendicularity.  In other words:
    vec[0] * ans[0] + vec[1] * ans[1] + vec[2] * ans[2] == 0
    
    We could say ans[1] and ans[2] are 1:
    vec[0] * ans[0] + vec[1] + vec[2] == 0

    This allows us to solve for ans[0], provided vec[0] != 0:
    ans[0] == -(vec[1] + vec[2]) / vec[0]

    If vec[0] is 0, then we could do similar things for the other two
    dimensions.

    If vec is the zero vector, nothing's perpendicular.
    */

    let i;
    for (i = 0; i < this.n; ++i) {
      if (this.data[i] !== 0) {
        break;
      }
    }

    if (i === this.n) {
      throw MessagedException("No perpendicular vector.");
    }

    const perpendicular = new this.constructor(...this.data.map(x => 1));
    let sum = 0;
    for (let j = 0; j < this.n; ++j) {
      if (j !== i) {
        sum += this.data[j];
      }
    }
    perpendicular.data[i] = -sum / this.data[i];
    return perpendicular.normalize();
  }

  get maximumComponent() {
    let max = this.data[0];
    for (let i = 1; i < this.n; ++i) {
      if (this.data[i] > max) {
        max = this.data[i];
      }
    }
    return max;
  }

  abs() {
    return new this.constructor(...this.data.map(value => Math.abs(value)));
  }

  rightShift(n) {
    return new this.constructor(...this.data.map(value => value >> n));
  }

  floor() {
    return new this.constructor(...this.data.map(value => Math.floor(value)));
  }

  ceil() {
    return new this.constructor(...this.data.map(value => Math.ceil(value)));
  }

  clamp(lo, hi) {
    return new this.constructor(...this.data.map(value => (value < lo) ? lo : (value > hi ? hi : value)));
  }

  dot(that) {
    return this.data.reduce((accumulator, value, i) => value * that.get(i) + accumulator, 0);
  }

  reflect(axis) {
    // Assume axis is normalized.
    return axis.scalarMultiply(2 * this.dot(axis)).subtract(this);
  }

  toArray() {
    return this.data.slice(0);
  }
}

// --------------------------------------------------------------------------- 

export class Vector2 extends VectorN {
  constructor(x = 0, y = 0) {
    super(2, [x, y]);
  }

  get x() {
    return this.data[0];
  }

  get y() {
    return this.data[1];
  }

  set x(value) {
    this.data[0] = value;
  }

  set y(value) {
    this.data[1] = value;
  }

  add(that) {
    return new Vector2(this.x + that.x, this.y + that.y);
  }

  subtract(that) {
    return new Vector2(this.x - that.x, this.y - that.y);
  }

  scalarMultiply(factor) {
    return new Vector2(factor * this.x, factor * this.y);
  }

  scalarDivide(factor) {
    return new Vector2(this.x / factor, this.y / factor);
  }

  round() {
    return new Vector2(Math.round(this.x), Math.round(this.y));
  }

  // dot(that) {
    // return this.x * that.x + this.y * that.y;
  // }

  lerp(that, t) {
    return new Vector2((1 - t) * this.x + t * that.x, (1 - t) * this.y + t * that.y);
  }

  toVector3(z = 0) {
    return new Vector3(this.x, this.y, z);
  }

  toVector4(z, w) {
    return new Vector4(this.x, this.y, z, w);
  }

  static zero() {
    return new Vector3(0, 0);
  }
}

// --------------------------------------------------------------------------- 

export class Vector3 extends VectorN {
  constructor(x = 0, y = x, z = x) {
    super(3, [x, y, z]);
  }

  get x() {
    return this.data[0];
  }

  get y() {
    return this.data[1];
  }

  get z() {
    return this.data[2];
  }

  set x(value) {
    this.data[0] = value;
  }

  set y(value) {
    this.data[1] = value;
  }

  set z(value) {
    this.data[2] = value;
  }

  add(that) {
    return new Vector3(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  subtract(that) {
    return new Vector3(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  scalarMultiply(factor) {
    return new Vector3(factor * this.x, factor * this.y, factor * this.z);
  }

  scalarDivide(factor) {
    return new Vector3(this.x / factor, this.y / factor, this.z / factor);
  }

  cross(other) {
    return new Vector3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  round() {
    return new Vector2(Math.round(this.x), Math.round(this.y), Math.round(this.z));
  }

  lerp(that, t) {
    return new Vector2((1 - t) * this.x + t * that.x, (1 - t) * this.y + t * that.y, (1 - t) * this.z + t * that.z);
  }

  dot(that) {
    return this.x * that.x + this.y * that.y + this.z * that.z;
  }

  toVector4(w) {
    return new Vector4(this.data[0], this.data[1], this.data[2], w);
  }

  static right() {
    return new Vector3(1, 0, 0);
  }

  static up() {
    return new Vector3(0, 1, 0);
  }

  static forward() {
    return new Vector3(0, 0, 1);
  }

  static zero() {
    return new Vector3(0, 0, 0);
  }

  static mean(vs) {
    return vs.reduce((acc, v) => acc.add(v), Vector3.zero()).scalarDivide(vs.length);
  }
}

// --------------------------------------------------------------------------- 

export class Vector4 extends VectorN {
  constructor(x = 0, y = 0, z = 0, w = 0) {
    super(4, [x, y, z, w]);
  }

  get x() {
    return this.data[0];
  }

  get y() {
    return this.data[1];
  }

  get z() {
    return this.data[2];
  }

  get w() {
    return this.data[3];
  }

  set x(value) {
    this.data[0] = value;
  }

  set y(value) {
    this.data[1] = value;
  }

  set z(value) {
    this.data[2] = value;
  }

  set w(value) {
    this.data[3] = value;
  }

  add(that) {
    return new Vector3(this.x + that.x, this.y + that.y, this.z + that.z, this.w + that.w);
  }

  subtract(that) {
    return new Vector3(this.x - that.x, this.y - that.y, this.z - that.z, this.w - that.w);
  }

  scalarMultiply(factor) {
    return new Vector3(factor * this.x, factor * this.y, factor * this.z, factor * this.w);
  }

  scalarDivide(factor) {
    return new Vector4(this.x / factor, this.y / factor, this.z / factor, this.w / factor);
  }

  round() {
    return new Vector2(Math.round(this.x), Math.round(this.y), Math.round(this.z), Math.round(this.w));
  }

  lerp(that, t) {
    return new Vector2((1 - t) * this.x + t * that.x, (1 - t) * this.y + t * that.y, (1 - t) * this.z + t * that.z, (1 - t) * this.z + t * that.z);
  }

  dot(that) {
    return this.x * that.x + this.y * that.y + this.z * that.z + this.w * that.w;
  }

  toVector3() {
    return new Vector3(this.data[0], this.data[1], this.data[2]);
  }

  static right() {
    return new Vector4(1, 0, 0, 0);
  }

  static up() {
    return new Vector4(0, 1, 0, 0);
  }

  static forward() {
    return new Vector4(0, 0, 1, 0);
  }

  static zero() {
    return new Vector3(0, 0, 0, 0);
  }
}

// --------------------------------------------------------------------------- 
