import {Vector2, Vector3} from './vector';

export class Field {
  constructor(dimensions, nchannels) {
    this.dimensions = dimensions;
    this.nchannels = nchannels;
    this.buffer = this.allocateBuffer(this.dimensions, this.nchannels);
  }

  whiteNoise() {
    for (let p of this) {
      for (let channelIndex = 0; channelIndex < this.nchannels; ++channelIndex) {
        const value = this.randomScalar();
        this.set(p, channelIndex, value);
      }
    }
  }

  static whiteNoise(dimensions, nchannels) {
    // This doesn't work yet. Some issue with transpiling?
    const field = new this.constructor(dimensions, nchannels);
    for (let p of field) {
      for (let channelIndex = 0; channelIndex < field.nchannels; ++channelIndex) {
        const value = field.randomScalar();
        field.set(p, channelIndex, value);
      }
    }
    return field;
  }
}

export class ByteField2 extends Field {}
export class ByteField3 extends Field {}

export class ObjectField2 extends Field {}
export class ObjectField3 extends Field {}

export class FloatField2 extends Field {
  toByteField() {
    const that = new ByteField2(this.dimensions, this.nchannels);
    for (let p of this) {
      for (let channelIndex = 0; channelIndex < this.nchannels; ++channelIndex) {
        that.set(p, channelIndex, Math.floor(this.get(p, channelIndex) * 255));
      }
    }
    return that;
  }

  resize(newDimensions) {
    const that = new FloatField2(newDimensions, this.nchannels);
    for (let p of that) {
      const proportion = p.divide(that.dimensions);
      const q = proportion.multiply(this.dimensions);
      for (let channelIndex = 0; channelIndex < this.nchannels; ++channelIndex) {
        const value = this.lerp(q, channelIndex);
        that.set(p, channelIndex, value);
      }
    }
    return that;
  }

  lerp(p, channelIndex) {
    const floor = p.floor();
    const fraction = p.subtract(floor);
    const ceiling = floor.add(Vector2.one()).mod(this.dimensions);

    const bottomLeft = this.getXy(floor.x, floor.y);
    const bottomRight = this.getXy(ceiling.x, floor.y);
    const topLeft = this.getXy(floor.x, ceiling.y);
    const topRight = this.getXy(ceiling.x, ceiling.y);

    const bottomMid = (1 - fraction.x) * bottomLeft + fraction.x * bottomRight;
    const topMid = (1 - fraction.x) * topLeft + fraction.x * topRight;
    const mid = (1 - fraction.y) * bottomMid + fraction.y * topMid;

    return mid;
  }

  slowPerlinNoise(scale) {
    const gradients = new ObjectField2(new Vector2(300, 300), 1);
    for (let p of gradients) {
      const radians = Math.random() * 2 * Math.PI;
      gradients.set(p, 0, new Vector2(Math.cos(radians), Math.sin(radians)));
    }

    const lerp = (t, a, b) => (1 - t) * a + t * b;
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);

    const perlin = p => {
      const wrappedPosition = p.mod(gradients.dimensions);
      const floor = wrappedPosition.floor();
      const ceiling = floor.scalarAdd(1).mod(gradients.dimensions);
      const fraction = wrappedPosition.subtract(floor);
      fraction.x = fade(fraction.x);
      fraction.y = fade(fraction.y);
      // console.log("p:", p.toString());
      // console.log("wrappedPosition:", wrappedPosition.toString());
      // console.log("floor:", floor.toString());
      // console.log("ceiling:", ceiling.toString());
      // console.log("fraction:", fraction.toString());

      // Neighbor positions.
      const bottomLeft = new Vector2(floor.x, floor.y);
      const bottomRight = new Vector2(ceiling.x, floor.y);
      const topLeft = new Vector2(floor.x, ceiling.y);
      const topRight = new Vector2(ceiling.x, ceiling.y);
      // console.log("bottomLeft:", bottomLeft.toString());
      // console.log("bottomRight:", bottomRight.toString());
      // console.log("topLeft:", topLeft.toString());
      // console.log("topRight:", topRight.toString());

      // Vectors to p.
      const fromBottomLeft = wrappedPosition.subtract(bottomLeft);
      const fromBottomRight = wrappedPosition.subtract(bottomRight);
      const fromTopLeft = wrappedPosition.subtract(topLeft);
      const fromTopRight = wrappedPosition.subtract(topRight);

      const bottomLeftDot = gradients.get(bottomLeft).dot(fromBottomLeft);
      const bottomRightDot = gradients.get(bottomRight).dot(fromBottomRight);
      const topLeftDot = gradients.get(topLeft).dot(fromTopLeft);
      const topRightDot = gradients.get(topRight).dot(fromTopRight);

      const bottomMix = lerp(fraction.x, bottomLeftDot, bottomRightDot);
      const topMix = lerp(fraction.x, topLeftDot, topRightDot);
      const mix = lerp(fraction.y, bottomMix, topMix);

      // -1 1
      // -0.5 0.5
      // 0 1
      return mix * 0.5 + 0.5;
    };

    for (let p of this) {
      for (let channelIndex = 0; channelIndex < this.nchannels; ++channelIndex) {
        const value = perlin(p.scalarMultiply(scale));
        this.set(p, channelIndex, value);
      }
    }
  }
}

export class FloatField3 extends Field {
  lerp(p, channelIndex) {
    const floor = p.floor();
    const fraction = p.subtract(floor);
    const ceiling = floor.add(Vector2.one()).mod(this.dimensions);

    const xyz = this.getXyz(floor.x, floor.y, floor.z);
    const Xyz = this.getXyz(ceiling.x, floor.y, floor.z);
    const xYz = this.getXyz(floor.x, ceiling.y, floor.z);
    const XYz = this.getXyz(ceiling.x, ceiling.y, floor.z);
    const xyZ = this.getXyz(floor.x, floor.y, ceiling.z);
    const XyZ = this.getXyz(ceiling.x, floor.y, ceiling.z);
    const xYZ = this.getXyz(floor.x, ceiling.y, ceiling.z);
    const XYZ = this.getXyz(ceiling.x, ceiling.y, ceiling.z);

    const lerp1 = (t, a, b) => (1 - t) * a + t * b;
    const yz = lerp1(fraction.x, xyz, Xyz);
    const Yz = lerp1(fraction.x, xYz, XYz);
    const yZ = lerp1(fraction.x, xyZ, XyZ);
    const YZ = lerp1(fraction.x, xYZ, XYZ);

    const z = lerp1(fraction.y, yz, Yz);
    const Z = lerp1(fraction.y, yZ, YZ);

    const mid = lerp1(fraction.z, z, Z);

    return mid;
  }

  static slowPerlinNoise(scale) {
    const gradients = new ObjectField3(new Vector3(50, 50, 50), 1);
    for (let p of gradients) {
      const longitudeRadians = Math.random() * 2 * Math.PI;
      const latitudeRadians = Math.random() * Math.PI;
      gradients.set(p, 0, new Vector3(
        Math.cos(longitudeRadians) * Math.sin(latitudeRadians),
        Math.cos(latitudeRadians),
        Math.sin(longitudeRadians) * Math.sin(latitudeRadians),
      ));
    }
    // console.log("gradients:", gradients);

    const lerp = (t, a, b) => (1 - t) * a + t * b;
    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);

    const perlin = p => {
      const wrappedPosition = p.mod(gradients.dimensions);
      for (let d = 0; d < 3; ++d) {
        if (wrappedPosition.get(d) < 0) {
          wrappedPosition.set(d, gradients.dimensions.get(d) + wrappedPosition.get(d));
        }
      }
      // console.log("p:", p.toString());
      // console.log("wrappedPosition:", wrappedPosition.toString());
      const floor = wrappedPosition.floor();
      // console.log("floor:", floor.toString());
      const ceiling = floor.scalarAdd(1).mod(gradients.dimensions);
      const fraction = wrappedPosition.subtract(floor);
      fraction.x = fade(fraction.x);
      fraction.y = fade(fraction.y);
      fraction.z = fade(fraction.z);

      // Neighbor positions.
      const xyz = new Vector3(floor.x, floor.y, floor.z);
      const Xyz = new Vector3(ceiling.x, floor.y, floor.z);
      const xYz = new Vector3(floor.x, ceiling.y, floor.z);
      const XYz = new Vector3(ceiling.x, ceiling.y, floor.z);
      const xyZ = new Vector3(floor.x, floor.y, ceiling.z);
      const XyZ = new Vector3(ceiling.x, floor.y, ceiling.z);
      const xYZ = new Vector3(floor.x, ceiling.y, ceiling.z);
      const XYZ = new Vector3(ceiling.x, ceiling.y, ceiling.z);

      // Vectors to p.
      const vxyz = wrappedPosition.subtract(xyz);
      const vXyz = wrappedPosition.subtract(Xyz);
      const vxYz = wrappedPosition.subtract(xYz);
      const vXYz = wrappedPosition.subtract(XYz);
      const vxyZ = wrappedPosition.subtract(xyZ);
      const vXyZ = wrappedPosition.subtract(XyZ);
      const vxYZ = wrappedPosition.subtract(xYZ);
      const vXYZ = wrappedPosition.subtract(XYZ);

      // console.log("xyz:", xyz.toString());
      // console.log("vxyz:", vxyz.toString());
      const dxyz = gradients.get(xyz).dot(vxyz);
      const dXyz = gradients.get(Xyz).dot(vXyz);
      const dxYz = gradients.get(xYz).dot(vxYz);
      const dXYz = gradients.get(XYz).dot(vXYz);
      const dxyZ = gradients.get(xyZ).dot(vxyZ);
      const dXyZ = gradients.get(XyZ).dot(vXyZ);
      const dxYZ = gradients.get(xYZ).dot(vxYZ);
      const dXYZ = gradients.get(XYZ).dot(vXYZ);

      const myz = lerp(fraction.x, dxyz, dXyz);
      const mYz = lerp(fraction.x, dxYz, dXYz);
      const myZ = lerp(fraction.x, dxyZ, dXyZ);
      const mYZ = lerp(fraction.x, dxYZ, dXYZ);

      const mz = lerp(fraction.y, myz, mYz);
      const mZ = lerp(fraction.y, myZ, mYZ);

      const m = lerp(fraction.z, mz, mZ);

      return m;
    };

    return p => perlin(p.scalarMultiply(scale).scalarAdd(20));

    // for (let p of this) {
      // for (let channelIndex = 0; channelIndex < this.nchannels; ++channelIndex) {
        // const value = perlin(p.scalarMultiply(scale));
        // this.set(p, channelIndex, value);
      // }
    // }
  }
}

// --------------------------------------------------------------------------- 

const ObjectFieldMixin = {
  allocateBuffer(dimensions, nchannels) {
    return new Array(dimensions.product * nchannels);
  },
};

Object.assign(ObjectField2.prototype, ObjectFieldMixin);
Object.assign(ObjectField3.prototype, ObjectFieldMixin);

// --------------------------------------------------------------------------- 

const ByteFieldMixin = {
  allocateBuffer(dimensions, nchannels) {
    return new Uint8ClampedArray(dimensions.product * nchannels);
  },

  randomScalar() {
    return Math.floor(Math.random() * 255);
  }
};

Object.assign(ByteField2.prototype, ByteFieldMixin);
Object.assign(ByteField3.prototype, ByteFieldMixin);

// --------------------------------------------------------------------------- 

const FloatFieldMixin = {
  allocateBuffer(dimensions, nchannels) {
    return new Float32Array(dimensions.product * nchannels);
  },

  randomScalar() {
    return Math.random();
  },

  modulate(factor, channelIndex = 0) {
    for (let p of this) {
      this.set(p, channelIndex, this.get(p, channelIndex) * factor);
    }
  },

  add(that) {
    for (let p of this) {
      for (let channelIndex = 0; channelIndex < this.nchannels; ++channelIndex) {
        this.set(p, channelIndex, this.get(p, channelIndex) + that.get(p, channelIndex));
      }
    }
  }
};


Object.assign(FloatField2.prototype, FloatFieldMixin);
Object.assign(FloatField3.prototype, FloatFieldMixin);

// --------------------------------------------------------------------------- 

// const ByteFieldStaticMixin = {
// };

// Object.assign(ByteField2, ByteFieldStaticMixin);
// Object.assign(ByteField3, ByteFieldStaticMixin);

// --------------------------------------------------------------------------- 

const Field2Mixin = {
  *[Symbol.iterator]() {
    const p = new Vector2(0, 0);
    for (p.y = 0; p.y < this.dimensions.y; ++p.y) {
      for (p.x = 0; p.x < this.dimensions.x; ++p.x) {
        yield p;
      }
    }
  },

  set(p, channelIndex, value) {
    const i = (p.y * this.dimensions.x + p.x) * this.nchannels + channelIndex;
    this.buffer[i] = value;
  },

  get(p, channelIndex = 0) {
    const i = (p.y * this.dimensions.x + p.x) * this.nchannels + channelIndex;
    return this.buffer[i];
  },

  getXy(x, y, channelIndex = 0) {
    const i = (y * this.dimensions.x + x) * this.nchannels + channelIndex;
    return this.buffer[i];
  },

  toFourChannel(alpha) {
    if (this.nchannels === 1) {
      const four = new this.constructor(this.dimensions, 4);
      for (let p of this) {
        four.set(p, 0, this.get(p));
        four.set(p, 1, this.get(p));
        four.set(p, 2, this.get(p));
        four.set(p, 3, alpha);
      }
      return four;
    } else {
      throw 'wrong # channels';
    }
  },

  toDataUrl() {
    const imageData = new ImageData(this.buffer, this.dimensions.x, this.dimensions.y);
    const canvas = document.createElement('canvas');
    canvas.width = this.dimensions.x;
    canvas.height = this.dimensions.y;
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    const result = canvas.toDataURL();
    return result;
  },
};

Object.assign(ByteField2.prototype, Field2Mixin);
Object.assign(FloatField2.prototype, Field2Mixin);
Object.assign(ObjectField2.prototype, Field2Mixin);

// --------------------------------------------------------------------------- 

const Field3Mixin = {
  *[Symbol.iterator]() {
    const p = new Vector3(0, 0, 0);
    for (p.z = 0; p.z < this.dimensions.z; ++p.z) {
      for (p.y = 0; p.y < this.dimensions.y; ++p.y) {
        for (p.x = 0; p.x < this.dimensions.x; ++p.x) {
          yield p;
        }
      }
    }
  },

  set(p, channelIndex, value) {
    const i = ((p.z * this.dimensions.y + p.y) * this.dimensions.x + p.x) * this.nchannels + channelIndex;
    this.buffer[i] = value;
  },

  get(p, channelIndex = 0) {
    const i = ((p.z * this.dimensions.y + p.y) * this.dimensions.x + p.x) * this.nchannels + channelIndex;
    return this.buffer[i];
  },

  getXyz(x, y, z, channelIndex = 0) {
    const i = ((z * this.dimensions.y + y) * this.dimensions.x + x) * this.nchannels + channelIndex;
    return this.buffer[i];
  },

  toFourChannel(alpha) {
    if (this.nchannels === 1) {
      const four = new this.constructor(this.dimensions, 4);
      for (let p of this) {
        four.set(p, 0, this.get(p));
        four.set(p, 1, this.get(p));
        four.set(p, 2, this.get(p));
        four.set(p, 3, alpha);
      }
      return four;
    } else {
      throw 'wrong # channels';
    }
  },
};

Object.assign(FloatField3.prototype, Field3Mixin);
Object.assign(ObjectField3.prototype, Field3Mixin);

// --------------------------------------------------------------------------- 

