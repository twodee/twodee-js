import {Vector2} from './vector';

export class Field2 {
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

  get2(c, r) {
    return this.data[r * this.dimensions.x + c];
  }

  get(i) {
    return this.data[i.y * this.dimensions.x + i.x];
  }

  set(i, value) {
    this.data[i.y * this.dimensions.x + i.x] = value;
  }

  lerpClamped(i) {
    const iFloor = i.floor();
    const iCeil = i.ceil().clamp(new Vector2(0, 0), new Vector2(this.dimensions.scalarSubtract(1)));
    const iFraction = i.subtract(iFloor);

    const a = (1 - iFraction.y) * this.get2(iFloor.x, iFloor.y) + iFraction.y * this.get2(iFloor.x, iCeil.y);
    const b = (1 - iFraction.y) * this.get2(iCeil.x, iFloor.y) + iFraction.y * this.get2(iCeil.x, iCeil.y);
    const c = (1 - iFraction.x) * a + iFraction.x * b;

    return c;
  }

  lerpWrapped(i) {
    const iFloor = i.floor();
    const iCeil = new Vector2(
      (iFloor.x + 1) % this.dimensions.x,
      (iFloor.y + 1) % this.dimensions.y
    );
    const iFraction = i.subtract(iFloor);

    const a = (1 - iFraction.y) * this.get2(iFloor.x, iFloor.y) + iFraction.y * this.get2(iFloor.x, iCeil.y);
    const b = (1 - iFraction.y) * this.get2(iCeil.x, iFloor.y) + iFraction.y * this.get2(iCeil.x, iCeil.y);
    const c = (1 - iFraction.x) * a + iFraction.x * b;

    return c;
  }

  *[Symbol.iterator]() {
    const i = new Vector2(0, 0);
    for (i.y = 0; i.y < this.dimensions.y; ++i.y) {
      for (i.x = 0; i.x < this.dimensions.x; ++i.x) {
        yield i;
      }
    }
  }

  resample(newDimensions) {
    const newField = Field2.allocate(newDimensions);
    const iMax = newField.dimensions;
    const jMax = this.dimensions;
    for (let i of newField) {
      const j = i.divide(iMax).multiply(jMax);
      newField.set(i, this.lerpWrapped(j));
    }
    return newField;
  }

  static valueNoise(dimensions, octaveCount) {
    const field = Field2.allocate(dimensions);
    for (let octaveIndex = 0; octaveIndex < octaveCount; octaveIndex += 1) {
      const octaveDimensions = dimensions.rightShift(octaveIndex);
      let octave = Field2.whiteNoise(octaveDimensions);
      if (octaveIndex > 0) {
        octave = octave.resample(dimensions);
      }
      const weight = (1 << octaveIndex) / ((2 << (octaveCount - 1)) - 1);
      for (let i of field) {
        field.set(i, field.get(i) + octave.get(i) * weight);
      }
    }
    return field;
  }

  toUnsignedByte() {
    const field = new Field2(this.dimensions, null);
    field.data = new Uint8Array(field.size);
    for (let i = 0; i < this.size; ++i) {
      field.data[i] = Math.floor(this.data[i] * 255);
    }
    return field;
  }

  static allocate(dimensions) {
    const field = new Field2(dimensions, null);
    field.data = new Float32Array(field.size);
    return field;
  }

  static whiteNoise(dimensions) {
    const field = this.allocate(dimensions);
    for (let i = 0; i < field.size; i += 1) {
      field.data[i] = Math.random();
    }
    return field;
  }
}
