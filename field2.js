import {Vector2, Vector3} from './vector';
import {Noise} from './noise';

export class Field2 {
  static allocate(dimensions, nchannels) {
    const field = new Field2(dimensions, nchannels, null);
    field.data = new Float32Array(field.nelements);
    return field;
  }

  static whiteNoise(dimensions) {
    const field = this.allocate(dimensions, 1);
    for (let i = 0; i < field.nelements; i += 1) {
      field.data[i] = Math.random();
    }
    return field;
  }

  static fractalValueNoise(dimensions, layerCount) {
    const field = this.allocate(dimensions, 1);
    for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
      let layer = this.whiteNoise(dimensions.rightShift(layerIndex));
      if (layerIndex > 0) {
        layer = layer.scale(dimensions);
      }
      const weight = (1 << layerIndex) / ((1 << layerCount) - 1);
      for (let p of field) {
        field.set(p, 0, field.get(p, 0) + weight * layer.get(p, 0));
      }
    }
    return field;
  }

  static perlinNoise(dimensions, scale) {
    const field = this.allocate(dimensions, 1);
    for (let p of field) {
      const value = Noise.perlinNoise(new Vector3(p.x * scale.x, p.y * scale.y, 0.5));
      field.set(p, 0, value);
    }
    return field;
  }

  static fractalPerlinNoise(dimensions, scale, layerCount) {
    const field = this.allocate(dimensions, 1);
    for (let p of field) {
      const value = Noise.fractalPerlinNoise(new Vector3(p.x * scale.x, p.y * scale.y, 0.5), layerCount);
      field.set(p, 0, value);
    }
    return field;
  }

  static slowPerlin(dimensions, scale) {
    const field = this.allocate(dimensions, 1);
    for (let p of field) {
      const value = Noise.slowPerlin2(p.multiply(scale));
      field.set(p, 0, value * 0.5 + 0.5);
      // field.set(p, 0, Math.abs(value));
    }
    return field;
  }

  static slowFractalPerlin(dimensions, scale, layerCount) {
    const field = this.allocate(dimensions, 1);
    for (let p of field) {
      const value = Noise.slowFractalPerlin2(p.multiply(scale), layerCount);
      field.set(p, 0, value * 0.5 + 0.5);
    }
    return field;
  }

  constructor(dimensions, nchannels, data) {
    this.dimensions = dimensions;
    this.nchannels = nchannels;
    this.nelements = this.dimensions.product * this.nchannels;
    this.data = data;
  }

  get width() {
    return this.dimensions.x;
  }

  get height() {
    return this.dimensions.y;
  }

  get2(c, r, iChannel = 0) {
    return this.data[(r * this.dimensions.x + c) * this.nchannels + iChannel];
  }

  get(p, iChannel = 0) {
    return this.data[(p.y * this.dimensions.x + p.x) * this.nchannels + iChannel];
  }

  set(p, iChannel, value) {
    this.data[(p.y * this.dimensions.x + p.x) * this.nchannels + iChannel] = value;
  }

  toRGBA() {
    if (this.nchannels === 1) {
      const field = new Field2(this.dimensions, 4, null);
      field.data = new Uint8ClampedArray(field.nelements);
      for (let i = 0; i < this.nelements; ++i) {
        field.data[i * 4 + 0] = Math.floor(this.data[i] * 255);
        field.data[i * 4 + 1] = field.data[i * 4 + 0];
        field.data[i * 4 + 2] = field.data[i * 4 + 0];
        field.data[i * 4 + 3] = 255;
      }
      return field;
    } else {
      throw 'funsupported channels';
    }
  }

  toBlob(type = 'image/png', quality = 1) {
    if (this.nchannels === 4) {
      // https://jsfiddle.net/9ggpqzL0
      const imageData = new ImageData(this.data, this.width, this.height);
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      canvas.getContext('2d').putImageData(imageData, 0, 0);
      return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    } else {
      throw 'unsupported channels';
    }
  }

  lerpClamped(p, iChannel = 0) {
    const iFloor = p.floor();
    const iCeil = p.ceil().clamp(new Vector2(0, 0), new Vector2(this.dimensions.scalarSubtract(1)));
    const iFraction = p.subtract(iFloor);

    const a = (1 - iFraction.y) * this.get2(iFloor.x, iFloor.y, iChannel) + iFraction.y * this.get2(iFloor.x, iCeil.y, iChannel);
    const b = (1 - iFraction.y) * this.get2(iCeil.x, iFloor.y, iChannel) + iFraction.y * this.get2(iCeil.x, iCeil.y, iChannel);
    const c = (1 - iFraction.x) * a + iFraction.x * b;

    return c;
  }

  lerpWrapped(p, iChannel = 0) {
    const iFloor = p.floor();
    const iCeil = new Vector2(
      (iFloor.x + 1) % this.dimensions.x,
      (iFloor.y + 1) % this.dimensions.y
    );
    const iFraction = p.subtract(iFloor);

    const a = (1 - iFraction.y) * this.get2(iFloor.x, iFloor.y, iChannel) + iFraction.y * this.get2(iFloor.x, iCeil.y, iChannel);
    const b = (1 - iFraction.y) * this.get2(iCeil.x, iFloor.y, iChannel) + iFraction.y * this.get2(iCeil.x, iCeil.y, iChannel);
    const c = (1 - iFraction.x) * a + iFraction.x * b;

    return c;
  }

  *[Symbol.iterator]() {
    const p = new Vector2(0, 0);
    for (p.y = 0; p.y < this.dimensions.y; ++p.y) {
      for (p.x = 0; p.x < this.dimensions.x; ++p.x) {
        yield p;
      }
    }
  }

  multiply(iChannel, factor) {
    for (let p of this) {
      this.set(p, iChannel, this.get(p, iChannel) * factor);
    }
  }

  abs(iChannel) {
    for (let p of this) {
      for (let ci = 0; ci < this.nchannels; ++ci) {
        this.set(p, ci, Math.abs(this.get(p, iChannel)));
      }
    }
  }

  clone() {
    const newField = Field2.allocate(this.dimensions.clone(), this.nchannels);
    for (let i = 0; i < this.nelements; ++i) {
      newField.data[i] = this.data[i];
    }
    return newField;
  }

  add(that) {
    if (this.nchannels !== that.nchannels) {
      throw 'size mismatch';
    }

    for (let p of this) {
      for (let ci = 0; ci < this.nchannels; ++ci) {
        this.set(p, ci, this.get(p, ci) + that.get(p, ci));
      }
    }
  }

  scale(newDimensions) {
    const newField = Field2.allocate(newDimensions, this.nchannels);
    for (let p of newField) {
      const j = p.divide(newField.dimensions).multiply(this.dimensions);
      for (let ci = 0; ci < this.nchannels; ++ci) {
        newField.set(p, ci, this.lerpWrapped(j, ci));
      }
    }
    return newField;
  }

  toUint8Array() {
    const bytes = new Uint8Array(this.nelements);
    for (let i = 0; i < this.nelements; ++i) {
      bytes[i] = Math.floor(this.data[i] * 255);
    }
    return bytes;
  }
}
