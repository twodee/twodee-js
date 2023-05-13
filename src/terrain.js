import {Trimesh} from './trimesh';
import {Vector2, Vector3} from './vector';

export class Terrain {
  constructor(width, depth, elevations, scales) {
    this.width = width;
    this.depth = depth;
    this.elevations = elevations;
    this.scales = scales; 
  }

  get scaledWidth() {
    return this.scales[0] * (this.width - 1);
  }

  get scaledDepth() {
    return this.scales[2] * (this.depth - 1);
  }

  get(x, z) {
    return this.elevations[z * this.width + x];
  }

  set(x, z, value) {
    this.elevations[z * this.width + x] = value;
  }

  lerp(x, z) {
    const unscaledX = x / this.scales[0];
    const unscaledZ = z / this.scales[2];
    const floorX = Math.floor(unscaledX);
    const floorZ = Math.floor(unscaledZ);
    const ceilX = floorX < this.width - 1 ? floorX + 1 : floorX;
    const ceilZ = floorZ < this.width - 1 ? floorZ + 1 : floorZ;
    const fractionX = unscaledX - floorX;
    const fractionZ = unscaledZ - floorZ;
    const a = (1 - fractionX) * this.get(floorX, floorZ) + fractionX * this.get(ceilX, floorZ);
    const b = (1 - fractionX) * this.get(floorX, ceilZ) + fractionX * this.get(ceilX, ceilZ);
    const y = (1 - fractionZ) * a + fractionZ * b;
    return y * this.scales[1];
  }

  toTrimesh(texFactors = new Vector2(1, 1)) {
    const positions = [];
    const texPositions = [];
    for (let z = 0; z < this.depth; z += 1) {
      for (let x = 0; x < this.width; x += 1) {
        positions.push(new Vector3(x * this.scales[0], this.get(x, z) * this.scales[1], z * this.scales[2]));
        texPositions.push(new Vector2(x / (this.width - 1) * texFactors.x, z / (this.depth - 1) * texFactors.y));
      }
    }

    const faces = [];
    for (let z = 0; z < this.depth - 1; z += 1) {
      const nextZ = z + 1;
      for (let x = 0; x < this.width - 1; x += 1) {
        const nextX = x + 1;
        faces.push([z * this.width + x, nextZ * this.width + x, z * this.width + nextX]);
        faces.push([nextZ * this.width + x, nextZ * this.width + nextX, z * this.width + nextX]);
      }
    }

    return new Trimesh(positions, faces, null, {texPositions});
  }
}

