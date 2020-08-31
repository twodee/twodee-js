import {Vector3} from './vector.js';
import {Matrix4} from './matrix.js';

export class Camera {
  constructor(from, to, up) {
    this.lookAt(from, to, up);
  }

  lookAt(from, to, up) {
    this.from = from;
    this.to = to;

    this.forward = to.subtract(from).normalize();
    this.right = this.forward.cross(up).normalize();
    this.up = this.right.cross(this.forward);

    const rotater = new Matrix4();

    rotater.set(0, 0, this.right.x);
    rotater.set(0, 1, this.right.y);
    rotater.set(0, 2, this.right.z);

    rotater.set(1, 0, this.up.x);
    rotater.set(1, 1, this.up.y);
    rotater.set(1, 2, this.up.z);

    rotater.set(2, 0, -this.forward.x);
    rotater.set(2, 1, -this.forward.y);
    rotater.set(2, 2, -this.forward.z);

    this.matrix = rotater.multiplyMatrix(Matrix4.translate(-this.from.x, -this.from.y, -this.from.z));
  }

  roll(degrees) {
    const rotater = Matrix4.rotate(this.forward, degrees);
    const newUp = rotater.multiplyVector(this.up.toVector4(0)).toVector3();
    this.lookAt(this.from, this.to, newUp);
  }

  pitch(degrees) {
    const rotater = Matrix4.rotate(this.right, degrees);
    const newTo = this.from.add(rotater.multiplyVector(this.to.subtract(this.from).toVector4(0)).toVector3());
    const newUp = rotater.multiplyVector(this.up.toVector4(0)).toVector3();
    this.lookAt(this.from, newTo, newUp);
  }

  yaw(degrees) {
    const rotater = Matrix4.rotate(this.up, degrees);
    const newTo = this.from.add(rotater.multiplyVector(this.to.subtract(this.from).toVector4(0)).toVector3());
    const newUp = rotater.multiplyVector(this.up.toVector4(0)).toVector3();
    this.lookAt(this.from, newTo, this.up);
  }

  advance(delta) {
    const offset = this.forward.scalarMultiply(delta);
    this.lookAt(this.from.add(offset), this.to.add(offset), this.up);
  }

  strafe(delta) {
    const offset = this.right.scalarMultiply(delta);
    this.lookAt(this.from.add(offset), this.to.add(offset), this.up);
  }

  relocate(newFrom) {
    this.lookAt(newFrom, newFrom.add(this.to.subtract(this.from)), this.up);
  }

  toPod() {
    return {
      type: 'Camera',
      from: this.from.toArray(),
      to: this.to.toArray(),
      up: this.up.toArray(),
    };
  }

  static fromPod(pod) {
    return new Camera(new Vector3(...pod.from), new Vector3(...pod.to), new Vector3(...pod.up));
  }
}
