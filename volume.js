import {Vector3} from './vector';

export class Volume {
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

  lerp(i) {
    const iFloor = i.floor();
    const iCeil = i.ceil().clamp(new Vector3(0, 0, 0), new Vector3(this.dimensions.scalarSubtract(1)));
    const iFraction = i.subtract(iFloor);

    //
    const a = (1 - iFraction.z) * this.get3(iFloor.x, iFloor.y, iFloor.z) + iFraction.z * this.get3(iFloor.x, iFloor.y, iCeil.z);
    const b = (1 - iFraction.z) * this.get3(iCeil.x, iFloor.y, iFloor.z) + iFraction.z * this.get3(iCeil.x, iFloor.y, iCeil.z);
    const c = (1 - iFraction.z) * this.get3(iFloor.x, iCeil.y, iFloor.z) + iFraction.z * this.get3(iFloor.x, iCeil.y, iCeil.z);
    const d = (1 - iFraction.z) * this.get3(iCeil.x, iCeil.y, iFloor.z) + iFraction.z * this.get3(iCeil.x, iCeil.y, iCeil.z);

    //
    const e = (1 - iFraction.y) * a + iFraction.y * c;
    const f = (1 - iFraction.y) * b + iFraction.y * d;

    //
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

  resample(newDimensions) {
    const newVolume = Volume.allocate(newDimensions);
    const iMax = newVolume.dimensions.scalarSubtract(1);
    const jMax = this.dimensions.scalarSubtract(1);
    for (let i of newVolume) {
      const j = i.divide(iMax).multiply(jMax);
      const value = this.lerp(j);
      newVolume.set(i, this.lerp(j));
    }
    return newVolume;
  }

  static valueNoise(dimensions, octaveCount) {
    const volume = Volume.allocate(dimensions);
    for (let octaveIndex = 0; octaveIndex < octaveCount; octaveIndex += 1) {
      const octaveDimensions = dimensions.rightShift(octaveIndex);
      let octave = Volume.whiteNoise(octaveDimensions);
      if (octaveIndex > 0) {
        octave = octave.resample(dimensions);
      }
      const weight = (1 << octaveIndex) / ((2 << (octaveCount - 1)) - 1);
      for (let i of volume) {
        volume.set(i, volume.get(i) + octave.get(i) * weight);
      }
    }
    return volume;
  }

  toUnsignedByte() {
    const volume = new Volume(this.dimensions, null);
    volume.data = new Uint8Array(volume.size);
    for (let i = 0; i < this.size; ++i) {
      volume.data[i] = Math.floor(this.data[i] * 255);
    }
    return volume;
  }

  static allocate(dimensions) {
    const volume = new Volume(dimensions, null);
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
}
