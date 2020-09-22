export class Triangle {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  contains(other, epsilon = 1.0e-6) {
    const v0 = this.c.subtract(this.a);
    const v1 = this.b.subtract(this.a);
    const v2 = other.subtract(this.a);

    // Compute dot products.
    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);
   
    // Compute barycentric coordinates.
    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    
    // Check if point is in triangle
    return u >= -epsilon && v >= -epsilon && u + v < 1 + epsilon;
  }
}
