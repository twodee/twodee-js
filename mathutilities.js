export class MathUtilities {
  static clamp(lo, hi, x) {
    return x < lo ? lo : (x > hi ? hi : x);
  }

  static toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  static toRadians(degrees) {
    return degrees * Math.PI / 180;
  }
}
