import {Matrix4} from './matrix.js';
import {Vector2, Vector3} from './vector.js';
import {MathUtilities} from './math-utilities.js';

export class Trackball {
  constructor() {
    this.reset();
  }

  reset() {
    this.mouseSphere0 = null;
    this.previousMatrix = Matrix4.identity();
    this.matrix = this.previousMatrix;
    this.dimensions = new Vector2(0, 0);
    this.axis = null;
  }

  setViewport(width, height) {
    this.dimensions.x = width;
    this.dimensions.y = height;
  }

  pixelsToSphere(mousePixels) {
    const mouseNdc = mousePixels.divide(this.dimensions).scalarMultiply(2).subtract(new Vector2(1, 1));
    const zSquared = 1 - mouseNdc.x * mouseNdc.x - mouseNdc.y * mouseNdc.y;
    if (zSquared > 0) {
      return new Vector3(mouseNdc.x, mouseNdc.y, Math.sqrt(zSquared));
    } else {
      return new Vector3(mouseNdc.x, mouseNdc.y, 0).normalize();
    }
  }

  start(mousePixels) {
    this.mouseSphere0 = this.pixelsToSphere(mousePixels);
  }

  drag(mousePixels, factor) {
    const mouseSphere = this.pixelsToSphere(mousePixels);
    const dot = this.mouseSphere0.dot(mouseSphere);
    if (Math.abs(dot) < 0.9999) {
      const radians = Math.acos(dot) * factor;
      this.axis = this.mouseSphere0.cross(mouseSphere).normalize();
      const currentMatrix = Matrix4.rotate(this.axis, radians * 180 / Math.PI);
      this.matrix = currentMatrix.multiplyMatrix(this.previousMatrix);
    }
  }

  end(mousePixels) {
    this.previousMatrix = this.matrix;
    this.mouseSphere0 = null;
  }

  cancel(mousePixels) {
    this.matrix = this.previousMatrix;
    this.mouseSphere0 = null;
  }

  truck(degrees) {
    const currentMatrix = Matrix4.rotate(this.axis, degrees);
    this.previousMatrix = currentMatrix.multiplyMatrix(this.previousMatrix);
    this.matrix = this.previousMatrix;
  }
}
