import {Vector2} from './vector.js';

export class Polyline {
  static flatten(positions) {
    // Project the triangle down to two dimensions. A simple way to do this is
    // to get the polygon's normal and drop the dimension of the component with
    // the largest magnitude.
    //
    // Assumes positions are Vector3s.

    const fro = positions[0].subtract(positions[1]);
    const to = positions[2].subtract(positions[1]);
    const normalMagnitudes = fro.cross(to).abs();

    let indices;
    if (normalMagnitudes.x > normalMagnitudes.y && normalMagnitudes.x > normalMagnitudes.z) {
      indices = new Vector2(1, 2);
    } else if (normalMagnitudes.y > normalMagnitudes.x && normalMagnitudes.y > normalMagnitudes.z) {
      indices = new Vector2(0, 2);
    } else {
      indices = new Vector2(0, 1);
    }
    
    const flattenedPositions = positions.map(p => new Vector2(p.get(indices.get(0)), p.get(indices.get(1))));
    return flattenedPositions;
  }
}
