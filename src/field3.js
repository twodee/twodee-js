import {Vector3} from './vector';
import {Noise} from './noise';

export class Field3 {
  static allocate(dimensions) {
    const volume = new Field3(dimensions, null);
    volume.data = new Float32Array(volume.size);
    return volume;
  }

  static whiteNoise(dimensions) {
    const volume = this.allocate(dimensions);
    for (let i = 0; i < volume.size; i += 1) {
      volume.data[i] = Math.random();
    }
    return volume;
  }

  static valueNoise(dimensions, layerCount) {
    const volume = Field3.allocate(dimensions);
    for (let layerIndex = 0; layerIndex < layerCount; layerIndex += 1) {
      const layerDimensions = dimensions.rightShift(layerIndex);
      let layer = Field3.whiteNoise(layerDimensions);
      if (layerIndex > 0) {
        layer = layer.scale(dimensions);
      }
      const weight = (1 << layerIndex) / ((1 << layerCount) - 1);
      for (let i of volume) {
        volume.set(i, volume.get(i) + layer.get(i) * weight);
      }
    }
    return volume;
  }

  static perlinNoise(dimensions, scale) {
    const field = this.allocate(dimensions, 1);
    for (let p of field) {
      const value = Noise.perlinNoise(new Vector3(p.x * scale.x, p.y * scale.y, 0.5));
      field.set(p, value);
    }
    return field;
  }

  static fractalPerlinNoise(dimensions, scale, layerCount) {
    const field = this.allocate(dimensions, 1);
    for (let p of field) {
      const value = Noise.fractalPerlinNoise(p.multiply(scale), layerCount);
      field.set(p, value * 0.5 + 0.5);
    }
    return field;
  }

  constructor(dimensions, data) {
    this.dimensions = dimensions;
    this.size = this.dimensions.product;
    this.data = data;
  }

  get width() {
    return this.dimensions.x;
  }

  get height() {
    return this.dimensions.y;
  }

  get depth() {
    return this.dimensions.z;
  }

  get3(x, y, z) {
    return this.data[z * this.dimensions.x * this.dimensions.y + y * this.dimensions.x + x];
  }

  get(i) {
    return this.data[i.z * this.dimensions.x * this.dimensions.y + i.y * this.dimensions.x + i.x];
  }

  set(i, value) {
    this.data[i.z * this.dimensions.x * this.dimensions.y + i.y * this.dimensions.x + i.x] = value;
  }

  lerpClamped(i) {
    const iFloor = i.floor();
    const iCeil = i.ceil().clamp(new Vector3(0, 0, 0), new Vector3(this.dimensions.scalarSubtract(1)));
    const iFraction = i.subtract(iFloor);

    const a = (1 - iFraction.z) * this.get3(iFloor.x, iFloor.y, iFloor.z) + iFraction.z * this.get3(iFloor.x, iFloor.y, iCeil.z);
    const b = (1 - iFraction.z) * this.get3(iCeil.x, iFloor.y, iFloor.z) + iFraction.z * this.get3(iCeil.x, iFloor.y, iCeil.z);
    const c = (1 - iFraction.z) * this.get3(iFloor.x, iCeil.y, iFloor.z) + iFraction.z * this.get3(iFloor.x, iCeil.y, iCeil.z);
    const d = (1 - iFraction.z) * this.get3(iCeil.x, iCeil.y, iFloor.z) + iFraction.z * this.get3(iCeil.x, iCeil.y, iCeil.z);
    const e = (1 - iFraction.y) * a + iFraction.y * c;
    const f = (1 - iFraction.y) * b + iFraction.y * d;
    const g = (1 - iFraction.x) * e + iFraction.x * f;

    return g;
  }

  lerpWrapped(i) {
    const iFloor = i.floor();
    const iCeil = new Vector3(
      (iFloor.x + 1) % this.dimensions.x,
      (iFloor.y + 1) % this.dimensions.y,
      (iFloor.z + 1) % this.dimensions.z
    );
    const iFraction = i.subtract(iFloor);

    const a = (1 - iFraction.z) * this.get3(iFloor.x, iFloor.y, iFloor.z) + iFraction.z * this.get3(iFloor.x, iFloor.y, iCeil.z);
    const b = (1 - iFraction.z) * this.get3(iCeil.x, iFloor.y, iFloor.z) + iFraction.z * this.get3(iCeil.x, iFloor.y, iCeil.z);
    const c = (1 - iFraction.z) * this.get3(iFloor.x, iCeil.y, iFloor.z) + iFraction.z * this.get3(iFloor.x, iCeil.y, iCeil.z);
    const d = (1 - iFraction.z) * this.get3(iCeil.x, iCeil.y, iFloor.z) + iFraction.z * this.get3(iCeil.x, iCeil.y, iCeil.z);
    const e = (1 - iFraction.y) * a + iFraction.y * c;
    const f = (1 - iFraction.y) * b + iFraction.y * d;
    const g = (1 - iFraction.x) * e + iFraction.x * f;

    return g;
  }

  *[Symbol.iterator]() {
    const i = new Vector3(0, 0, 0);
    for (i.z = 0; i.z < this.dimensions.z; ++i.z) {
      for (i.y = 0; i.y < this.dimensions.y; ++i.y) {
        for (i.x = 0; i.x < this.dimensions.x; ++i.x) {
          yield i;
        }
      }
    }
  }

  scale(newDimensions) {
    const newField = Field3.allocate(newDimensions);
    const iMax = newField.dimensions;
    const jMax = this.dimensions;
    for (let i of newField) {
      const j = i.divide(iMax).multiply(jMax);
      newField.set(i, this.lerpWrapped(j));
    }
    return newField;
  }

  toUint8Array() {
    const bytes = new Uint8Array(this.size);
    for (let i = 0; i < this.size; ++i) {
      bytes[i] = Math.floor(this.data[i] * 255);
    }
    return bytes;
  }
}
