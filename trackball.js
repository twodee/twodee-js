import {Matrix4} from './matrix.js';
import {Vector2, Vector3} from './vector.js';
import {MathUtilities} from './math-utilities.js';

export class Trackball {
  constructor() {
    this.reset();
  }

  reset() {
    this.mouseSphere0 = null;
    this.previousRotation = Matrix4.identity();
    this.rotation = this.previousRotation;
    this.dimensions = new Vector2(0, 0);
    this.axis = null;
  }

  setViewport(width, height) {
    this.dimensions.x = width;
    this.dimensions.y = height;
    console.log("this.dimensions.toString():", this.dimensions.toString());
  }

  pixelsToSphere(mousePixels) {
    console.log("mousePixels:", mousePixels.toString());
    console.log("this.dimensions:", this.dimensions);
    const mouseNdc = mousePixels.divide(this.dimensions).scalarMultiply(2).subtract(new Vector2(1, 1));
    console.log("mouseNdc.toString():", mouseNdc.toString());
    const zSquared = 1 - mouseNdc.x * mouseNdc.x - mouseNdc.y * mouseNdc.y;
    if (zSquared > 0) {
      return new Vector3(mouseNdc.x, mouseNdc.y, Math.sqrt(zSquared));
    } else {
      return new Vector3(mouseNdc.x, mouseNdc.y, 0).normalize();
    }
  }

  start(mousePixels) {
    this.mouseSphere0 = this.pixelsToSphere(mousePixels);
    console.log("this.mouseSphere0:", this.mouseSphere0.toString());
  }

  drag(mousePixels, factor) {
    const mouseSphere = this.pixelsToSphere(mousePixels);
    console.log("mouseSphere:", mouseSphere.toString());
    console.log("this.mouseSphere0.toString():", this.mouseSphere0.toString());
    const dot = this.mouseSphere0.dot(mouseSphere);
    console.log("dot:", dot);
    if (Math.abs(dot) < 0.9999) {
      const radians = Math.acos(dot) * factor;
      this.axis = this.mouseSphere0.cross(mouseSphere).normalize();
      const currentRotation = Matrix4.rotate(this.axis, radians * 180 / Math.PI);
      this.rotation = currentRotation.multiplyMatrix(this.previousRotation);
    }
  }

  end(mousePixels) {
    this.previousRotation = this.rotation;
    this.mouseSphere0 = null;
  }

  cancel(mousePixels) {
    this.rotation = this.previousRotation;
    this.mouseSphere0 = null;
  }

  truck(degrees) {
    const currentRotation = Matrix4.rotate(this.axis, degrees);
    this.previousRotation = currentRotation.multiplyMatrix(this.previousRotation);
    this.rotation = this.previousRotation;
  }
}
