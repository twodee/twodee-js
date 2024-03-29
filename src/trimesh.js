import {Vector3} from './vector.js';
import {Polyline} from './polyline.js';
import {Triangle} from './triangle.js';
import {VertexAttributes} from './vertex-attributes.js';

export class Trimesh {
  constructor(positions, faces, normals, extraVertexAttributes = {}) {
    this.positions = positions;
    this.faces = faces;
    this.normals = normals;
    this.extraVertexAttributes = extraVertexAttributes;

    this.bounds = undefined;
    this.centroid = undefined;

    this.calculateBounds();
  }

  setTexPositions(texPositions) {
    this.extraVertexAttributes.texPositions = texPositions;
  }

  flipV() {
    for (let uv of this.extraVertexAttributes.texPositions) {
      uv.y = 1 - uv.y;
    }
  }

  toObject() {
    const object = {
      positions: this.positions.flatMap(p => [p.x, p.y, p.z]),
      indices: this.faces.flat(),
    };

    if (this.normals) {
      object.normals = this.normals.flatMap(n => [n.x, n.y, n.z]);
    }

    return object;
  }

  color(rgb) {
    this.extraVertexAttributes.colors = new Array(this.vertexCount).fill(rgb);
  }

  toPod() {
    return {
      type: 'Trimesh',
      positions: this.positions.map(position => position.toArray()),
      // colors: this.colors?.map(color => color.toArray()),
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
      // pod.textureCoordinates?.map(coordinate => new Vector2(...coordinate)), 
    );

    if (pod.colors) {
      mesh.colors = pod.colors.map(color => new Vector3(...color)); 
    }

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

  transform(matrix) {
    for (let i = 0; i < this.positions.length; ++i) {
      this.positions[i] = matrix.multiplyVector(this.positions[i].toVector4(1)).toVector3();
    }

    // Transform normals
    if (this.normals) {
      // TODO use normal matrix
      for (let i = 0; i < this.normals.length; ++i) {
        this.normals[i] = matrix.multiplyVector(this.normals[i].toVector4(0)).toVector3();
      }
    }
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

    const oldExtraVertexAttributes = this.extraVertexAttributes;
    this.extraVertexAttributes = {};
    for (let attribute of Object.keys(oldExtraVertexAttributes)) {
      this.extraVertexAttributes[attribute] = new Array(this.faceCount * 3);
    }

    // Compute face normal. Accumulate to each connected vertex.
    let vertexIndex = 0;
    for (let face of this.faces) {
      const ab = oldPositions[face[1]].subtract(oldPositions[face[0]]);
      const ac = oldPositions[face[2]].subtract(oldPositions[face[0]]);
      const faceNormal = ab.cross(ac).normalize();
      for (let i = 0; i < 3; ++i) {
        this.positions[vertexIndex] = oldPositions[face[i]].clone();
        this.normals[vertexIndex] = faceNormal;

        for (let attribute of Object.keys(oldExtraVertexAttributes)) {
          this.extraVertexAttributes[attribute][vertexIndex] = oldExtraVertexAttributes[attribute][face[i]].clone();
        }

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

  flatPositions() {
    const flat = [];
    for (let position of this.positions) {
      flat.push(position.x);
      flat.push(position.y);
      flat.push(position.z);
      flat.push(1);
    }
    return flat;
  }

  flatColors() {
    const flat = [];
    for (let color of this.extraVertexAttributes.colors) {
      flat.push(color.x, color.y, color.z, 1);
    }
    return flat;
  }

  flatNormals() {
    const flat = [];
    for (let normal of this.normals) {
      flat.push(normal.x);
      flat.push(normal.y);
      flat.push(normal.z);
      flat.push(0);
    }
    return flat;
  }

  flatAttribute(attribute) {
    const flat = [];
    for (let value of this.extraVertexAttributes[attribute]) {
      flat.push(...value.data);
    }
    return flat;
  }

  flatFaces() {
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
    if (!Polyline.isCounterClockwise(flattenedPositions)) {
      remaining.reverse();
      isReversed = true;
    }

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
        let containsVertex = false;
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

  toVertexAttributes(options) {
    const attributes = new VertexAttributes();
    attributes.addAttribute('position', this.vertexCount, 4, this.flatPositions());
    if (options.normals) {
      attributes.addAttribute('normal', this.vertexCount, 4, this.flatNormals());
    }
    if (options.texPositions) {
      attributes.addAttribute('texPosition', this.vertexCount, 4, this.flatAttribute('texPositions'));
    }
    if (options.indices) {
      attributes.addIndices(this.flatFaces());
    }
    return attributes;
  }

  static join(a, b) {
    const positions = [...a.positions, ...b.positions];
    let normals = null;

    if (a.normals && b.normals) {
      normals = [...a.normals, ...b.normals];
    }

    const faces = [...a.faces];
    for (let face of b.faces) {
      faces.push([
        face[0] + a.vertexCount,
        face[1] + a.vertexCount,
        face[2] + a.vertexCount,
      ]);
    }

    // TODO: colors
    // extraVertexAttributes

    return new Trimesh(positions, faces, normals);
  }

  static mergeToObj(meshes) {
    let obj = '# Exported from twodee.js\n';

    let base = 1;
    for (let {name, mesh} of meshes) {
      obj += `o ${name}\n`;

      for (let position of mesh.positions) {
        obj += `v ${position.x} ${position.y} ${position.z}\n`;
      }

      for (let face of mesh.faces) {
        obj += `f ${face[0] + base} ${face[1] + base} ${face[2] + base}\n`;
      }

      base += mesh.positions.length;
    }

    return obj;
  }
}
