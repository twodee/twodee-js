import {Vector3} from './vector.js';
import {Polyline} from './polyline.js';
import {Triangle} from './triangle.js';

export class Trimesh {
  constructor(positions, faces, normals, textureCoordinates) {
    this.positions = positions;
    this.faces = faces;
    this.normals = normals;
    this.textureCoordinates = textureCoordinates;

    this.bounds = undefined;
    this.centroid = undefined;

    this.calculateBounds();
  }

  toPod() {
    return {
      type: 'Trimesh',
      positions: this.positions.map(position => position.toArray()),
      faces: this.faces,
      normals: this.normals?.map(normal => normal.toArray()),
      textureCoordinates: this.textureCoordinates?.map(coordinate => coordinate.toArray()),
      bounds: this.bounds ? {
        minimum: this.bounds.minimum.toArray(),
        maximum: this.bounds.maximum.toArray(),
      } : null,
      centroid: this.centroid?.toArray(),
    };
  }

  static fromPod(pod) {
    const mesh = new Trimesh(
      pod.positions.map(position => new Vector3(...position)), 
      pod.faces.map(face => [...face]), 
      pod.normals?.map(normal => new Vector3(...normal)), 
      pod.textureCoordinates?.map(coordinate => new Vector2(...coordinate)), 
    );

    if (pod.bounds) {
      mesh.bounds = {
        minimum: new Vector3(...pod.bounds.minimum),
        maximum: new Vector3(...pod.bounds.maximum),
      };
    }

    if (pod.centroid) {
      mesh.centroid = new Vector3(...pod.centroid);
    }

    return mesh;
  }

  smoothFaces() {
    // Zero out per-vertex normals.
    this.normals = new Array(this.vertexCount);
    for (let i = 0; i < this.vertexCount; ++i) {
      this.normals[i] = new Vector3(0, 0, 0);
    }

    // Compute face normal. Accumulate to each connected vertex.
    for (let face of this.faces) {
      const ab = this.positions[face[1]].subtract(this.positions[face[0]]);
      const ac = this.positions[face[2]].subtract(this.positions[face[0]]);
      const faceNormal = ab.cross(ac).normalize();
      for (let i = 0; i < 3; ++i) {
        this.normals[face[i]] = this.normals[face[i]].add(faceNormal);
      }
    }

    // Normalize per-vertex normals.
    for (let i = 0; i < this.vertexCount; ++i) {
      if (this.normals[i].magnitude > 0) {
        this.normals[i] = this.normals[i].normalize();
      }
    }
  }

  separateFaces() {
    const oldPositions = this.positions;

    this.positions = new Array(this.faceCount * 3);
    this.normals = new Array(this.faceCount * 3);

    // Compute face normal. Accumulate to each connected vertex.
    let vertexIndex = 0;
    for (let face of this.faces) {
      const ab = oldPositions[face[1]].subtract(oldPositions[face[0]]);
      const ac = oldPositions[face[2]].subtract(oldPositions[face[0]]);
      const faceNormal = ab.cross(ac).normalize();
      for (let i = 0; i < 3; ++i) {
        this.positions[vertexIndex] = oldPositions[face[i]].clone();
        this.normals[vertexIndex] = faceNormal;
        face[i] = vertexIndex;
        ++vertexIndex;
      }
    }
  }

  calculateBounds() {
    if (this.vertexCount > 0) {
      this.bounds = {
        minimum: this.positions[0].clone(),
        maximum: this.positions[0].clone(),
      };
    } else {
      this.bounds = {
        minimum: new Vector3(0, 0, 0),
        maximum: new Vector3(0, 0, 0),
      };
    }

    for (let position of this.positions) {
      if (position.x < this.bounds.minimum.x) {
        this.bounds.minimum.x = position.x;
      } else if (position.x > this.bounds.maximum.x) {
        this.bounds.maximum.x = position.x;
      }

      if (position.y < this.bounds.minimum.y) {
        this.bounds.minimum.y = position.y;
      } else if (position.y > this.bounds.maximum.y) {
        this.bounds.maximum.y = position.y;
      }

      if (position.z < this.bounds.minimum.z) {
        this.bounds.minimum.z = position.z;
      } else if (position.z > this.bounds.maximum.z) {
        this.bounds.maximum.z = position.z;
      }
    }

    this.centroid = this.bounds.minimum.add(this.bounds.maximum).scalarMultiply(0.5);
  }

  reverseWinding() {
    for (let face of this.faces) {
      const tmp = face[1];
      face[1] = face[2];
      face[2] = tmp;
    }
  }

  getFlatPositions() {
    const flat = [];
    for (let position of this.positions) {
      flat.push(position.x);
      flat.push(position.y);
      flat.push(position.z);
      flat.push(1);
    }
    return flat;
  }

  getFlatNormals() {
    const flat = [];
    for (let normal of this.normals) {
      flat.push(normal.x);
      flat.push(normal.y);
      flat.push(normal.z);
      flat.push(0);
    }
    return flat;
  }

  getFlatFaces() {
    return this.faces.flat();
  }

  get vertexCount() {
    return this.positions.length;
  }

  get faceCount() {
    return this.faces.length;
  }

  static triangulate(positions, fixWinding = false) {
    // Assumes polyline traces planar polygon. Assumes last position is not
    // coincident with the first.

    // Triangulating is easier in 2D.
    const flattenedPositions = Polyline.flatten(positions);
    
    const remaining = positions.map((position, index) => ({
      position3: position,
      position2: flattenedPositions[index],
      index
    }));
    const faces = [];

    // A negative signed area means the vertices are enumerated in clockwise
    // order in the Cartesian coordinate system with the origin at (0, 0) and
    // they y-axis pointing up.
    let isReversed = false;
    if (!Polyline.isCounterclockwise(flattenedPositions)) {
      remaining.reverse();
      isReversed = true;
    }
    console.log("isReversed:", isReversed);

    // While we have at least three vertices left, find an ear and make a face of it.
    while (remaining.length > 2) {

      // Look for an ear starting at each vertex in the list.
      let isEarFound = false;
      for (let i = 0; !isEarFound && i < remaining.length; ++i) {
        // Wrap around as needed.
        let j = (i + 1) % remaining.length;
        let k = (i + 2) % remaining.length;

        // See if this angle's interior angle is < 180 degrees. If it is, we can't make
        // a triangle here. It would fill an area outside the polygon.
        const fro = remaining[i].position2.subtract(remaining[j].position2);
        const to = remaining[k].position2.subtract(remaining[j].position2);

        const signedArea = to.x * fro.y - to.y * fro.x;
        if (signedArea < 0.0001) {
          if (i === remaining.length - 1) {
            throw new Error("no good angle");
          } else {
            continue;
          }
        }

        // See if any other vertex lies inside the triangle formed by ijk.
        const containsVertex = false;
        for (let ci = 0; !containsVertex && ci < remaining.length; ++ci) {
          if (ci !== i && ci !== j && ci !== k) {
            const triangle = new Triangle(remaining[i].position2, remaining[j].position2, remaining[k].position2);
            containsVertex = triangle.contains(remaining[ci].position2);
          }
        }

        // If no vertex is inside the triangle formed by ijk, it's an ear. Let's
        // lop it off by removing the central vertex from the polygon. The
        // vertices form a face.
        if (!containsVertex || remaining.length == 3) {
          faces.push([remaining[i].index, remaining[j].index, remaining[k].index]);
          remaining.splice(j, 1);
          isEarFound = true;
        }
      }

      if (!isEarFound) {
        throw new Error("no ear");
      }
    }

    const mesh = new Trimesh(positions, faces);
    if (!fixWinding && isReversed) {
      mesh.reverseWinding();
    }

    return mesh;
  }
}
