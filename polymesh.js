import {Vector3} from './vector.js';

export class Polymesh {
  constructor(positions, faces) {
    this.positions = positions;
    this.faces = faces;
  }

  get vertexCount() {
    return this.positions.length;
  }

  get faceCount() {
    return this.faces.length;
  }

  toTrimesh() {
  }

  subdivide() {
    // calculate faceMeans
    // create edge lut: edge -> {v0, v1, f0, f1}
    
    const faceMeans = this.faces.map(vertexIndices => {
      const sum = vertexIndices.reduce((sum, vertexIndex) => sum.add(this.positions[vertexIndex]), Vector3.zero()); 
      const mean = sum.scalarMultiply(1 / vertexIndices.length);
      return mean;
    });

    const edges = [];
    const vertexToEdge = this.positions.map(() => ({}));
    const vertexToFaces = this.positions.map(() => []);
    
    for (let [faceIndex, face] of this.faces.entries()) {
      for (let i = 0; i < face.length; ++i) {
        vertexToFaces[face[i]].push(faceIndex);

        let iNext = (i + 1) % face.length;
        let smaller = Math.min(face[i], face[iNext]);
        let bigger = Math.max(face[i], face[iNext]);

        if (vertexToEdge[smaller].hasOwnProperty(bigger)) {
          vertexToEdge[smaller][bigger].faces.push(faceIndex);
        } else {
          const edge = {vertex0: smaller, vertex1: bigger, faces: [faceIndex]};
          edges.push(edge);
          vertexToEdge[smaller][bigger] = edge;
          vertexToEdge[bigger][smaller] = edge;
        }
      }
    }

    for (let edge of edges) {
      let centroid = this.positions[edge.vertex0].add(this.positions[edge.vertex1]).scalarMultiply(0.5);
    }

    for (let i = 0; i < this.vertexCount; ++i) {
      const n = vertexToFaces[i].length;
      const m1 = (n - 3) / 3;
      const m2 = 1 / n;
      const m3 = 2 / n;
      this.positions[i] = this.positions[i].scalarMultiply(m1).add(
        meanFaceMean.scalarMultiply(m2).add(
          meanEdgeCentroid.scalarMultiply(m3)
        )
      );
    }

    // add edge centroids to positions
    // add face means to positions
  }
}
