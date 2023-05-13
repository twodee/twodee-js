import {Vector3} from './vector.js';

export class Plane {
  constructor(point, normal) {
    this.point = point;
    this.normal = normal;
  }

  intersectRay(from, direction) {
    const dot = this.normal.dot(direction);

    if (Math.abs(dot) < 1e-6) {
      return null;
    } else {
      const diff = this.point.subtract(from);
      const alpha = this.normal.dot(diff) / dot;
      const to = from.add(direction.scalarMultiply(alpha));
      return to;
    }
  }
}
