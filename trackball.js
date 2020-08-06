import {Matrix4} from './matrix.js';
import {Vector2, Vector3} from './vector.js';
import {MathUtilities} from './mathutilities.js';

export class Trackball {
  constructor() {
    this.reset();
    this.mouseAt = [0, 0];
    this.mouseDelta = [0, 0];
  }

  reset() {
    this.rotation = new Matrix4();
    this.lastRotation = new Matrix4();
    this.preDragRotation = new Matrix4();
  }

  repeat() {
    this.rotation = this.lastRotation.multiplyMatrix(this.rotation);
  }

  start(x, y) {
    this.mouseAt[0] = x;
    this.mouseAt[1] = y;
    this.mouseDelta[0] = 0;
    this.mouseDelta[1] = 0;
    this.preDragRotation = this.rotation;
  }

  drag(x, y, factor = 1) {
    this.mouseDelta[0] = x - this.mouseAt[0];
    this.mouseDelta[1] = y - this.mouseAt[1];

    if (this.mouseAt[0] != x || this.mouseAt[1] != y) {
      let minimumSpan = new Vector2(this.width, this.height).magnitude * 0.5;

      let previous = this.vectorToMouse(minimumSpan, this.mouseAt[0], this.mouseAt[1]);
      this.mouseAt[0] = x;
      this.mouseAt[1] = y;
      let current = this.vectorToMouse(minimumSpan, this.mouseAt[0], this.mouseAt[1]);

      let dot = MathUtilities.clamp(-1, 1, previous.dot(current));
      let degrees = Math.acos(dot) * 180 / Math.PI * factor;
      let axis = current.cross(previous).normalize();

      this.lastRotation = Matrix4.rotate(axis, degrees);
      this.rotation = this.lastRotation.multiplyMatrix(this.rotation);
    }
  }

  vectorToMouse(span, x, y) {
    let vector = new Vector3((x - this.width * 0.5) / span, -(y - this.height * 0.5) / span, 0);
    vector.z = 1.0 - vector.x * vector.x - vector.y * vector.y;
    if (vector.z < 0) {
      vector.z = 0;
      vector = vector.normalize();
    } else {
      vector.z = -Math.sqrt(vector.z);
    }
    return vector;
  }

  setViewport(width, height) {
    this.width = width;
    this.height = height;
  }
}
