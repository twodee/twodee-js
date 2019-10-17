// --------------------------------------------------------------------------- 

class VectorN {
  constructor(n, data) {
    this.n = n;
    this.data = data;
  }

  get(i) {
    if (i < n) {
      return this.data[i];
    } else {
      return 0;
    }
  }

  get magnitude() {
    return Math.sqrt(this.data.reduce((accumulator, datum) => accumulator + datum * datum, 0));
  }

  normalize() {
    return this.scalarDivide(this.magnitude);
  }

  flipAround(that) {
    return this.subtract(that).negate().add(that);
  }

  negate() {
    return this.scalarMultiply(-1);
  }

  distance(that) {
    return this.subtract(that).magnitude;
  }

  diagonalDistance(that) {
    let diff = that.subtract(this);
    return diff.reduce((a, b) => Math.max(a, b));
  }

  toString() {
    return `[${this.data.join(', ')}]`;
  }
}

// --------------------------------------------------------------------------- 

class Vector2 extends VectorN {
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

  dot(that) {
    return this.x * that.x + this.y * that.y;
  }

  lerp(that, t) {
    return new Vector2((1 - t) * this.x + t * that.x, (1 - t) * this.y + t * that.y);
  }
}

// --------------------------------------------------------------------------- 

class Vector3 extends VectorN {
  constructor(x = 0, y = 0, z = 0) {
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
}

// --------------------------------------------------------------------------- 

class Vector4 extends VectorN {
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
    return new Vector2(this.x / factor, this.y / factor, this.z / factor, this.w / factor);
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

  static right() {
    return new Vector4(1, 0, 0, 0);
  }

  static up() {
    return new Vector4(0, 1, 0, 0);
  }

  static forward() {
    return new Vector4(0, 0, 1, 0);
  }
}
