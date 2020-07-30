export class MathUtilities {
  static clamp(lo, hi, x) {
    return x < lo ? lo : (x > hi ? hi : x);
  }
}
