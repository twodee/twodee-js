import {Vector3} from './vector.js';
import {Matrix4} from './matrix.js';

export class Camera {
  constructor(from, to, worldUp) {
    this.worldUp = worldUp;
    this.from = from;
    this.forward = to.subtract(from).normalize();
  }

  static lookAt(from, to, worldUp) {
    const camera = new Camera(from, to, worldUp);
    camera.orient();
    return camera;
  }

  orient() {
    this.right = this.forward.cross(this.worldUp).normalize();
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
    this.forward = rotater.multiplyVector(this.forward.toVector4(0)).toVector3();
    this.orient();
  }

  yaw(degrees) {
    const rotater = Matrix4.rotate(this.worldUp, degrees);
    this.forward = rotater.multiplyVector(this.forward.toVector4(0)).toVector3();
    this.orient();
  }

  advance(delta) {
    const offset = this.forward.scalarMultiply(delta);
    this.from = this.from.add(offset);
    this.orient();
  }

  strafe(delta) {
    const offset = this.right.scalarMultiply(delta);
    this.from = this.from.add(offset);
    this.orient();
  }

  relocate(newFrom) {
    this.from = newFrom;
    this.orient();
  }

  toPod() {
    return {
      type: 'Camera',
      from: this.from.toArray(),
      forward: this.forward.toArray(),
      worldUp: this.worldUp.toArray(),
    };
  }

  static fromPod(pod) {
    const camera = Object.create(this.prototype);
    camera.from = new Vector3(...pod.from);
    camera.forward = new Vector3(...pod.forward);
    camera.worldUp = new Vector3(...pod.worldUp);
    camera.orient();
    return camera;
  }
}

export class HeightmapCamera extends Camera {
  constructor(from, to, worldUp, heightmap, eyeLevel) {
    super(from, to, worldUp);
    this.heightmap = heightmap;
    this.eyeLevel = eyeLevel;
  }

  static lookAt(from, to, worldUp, heightmap, eyeLevel) {
    const camera = new HeightmapCamera(from, to, worldUp, heightmap, eyeLevel);
    camera.elevate();
    camera.orient();
    return camera;
  }

  elevate() {
    if (this.from.x < 0) {
      this.from.x = 0;
    } else if (this.from.x >= this.heightmap.scaledWidth) {
      this.from.x = this.heightmap.scaledWidth;
    }

    if (this.from.z < 0) {
      this.from.z = 0;
    } else if (this.from.z >= this.heightmap.scaledDepth) {
      this.from.z = this.heightmap.scaledDepth;
    }

    this.from.y = this.heightmap.lerp(this.from.x, this.from.z) + this.eyeLevel;
  }

  advance(delta) {
    const offset = this.forward.scalarMultiply(delta);
    this.from = this.from.add(offset);
    this.elevate();
    this.orient();
  }

  strafe(delta) {
    const offset = this.right.scalarMultiply(delta);
    this.from = this.from.add(offset);
    this.elevate();
    this.orient();
  }
}
