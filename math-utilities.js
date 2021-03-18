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

  static isClose(a, b, epsilon) {
    return Math.abs(a - b) <= epsilon;
  }

  static powerOfTwoCeiling(x) {
    return Math.pow(2, Math.ceil(Math.log2(x)));
  }

  static isPowerOfTwo(x) {
    return x & (x - 1) === 0;
  }
}
