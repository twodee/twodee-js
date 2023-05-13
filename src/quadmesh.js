import {MathUtilities} from './math-utilities.js';
import {Trimesh} from './trimesh.js';
import {Vector3} from './vector.js';

export class Quadmesh {
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
    const positions = this.positions.map(position => position.clone());
    const faces = this.faces.flatMap(face => {
      const triangles = [
        [face[0], face[1], face[2]],
        [face[0], face[2], face[3]],
      ];
      // for (let i = 2; i < face.length; ++i) {
        // triangles.push([face[0], face[i - 1], face[i]]);
      // }
      return triangles;
    });
    return new Trimesh(positions, faces);
  }

  subdivide() {
    // https://rosettacode.org/wiki/Catmull%E2%80%93Clark_subdivision_surface

    const newPositions = [];
    const newFaces = [];

    // We need the centroids of every face.
    const faceCentroids = this.faces.map(face => {
      return Vector3.mean(face.map(vertexIndex => this.positions[vertexIndex]));
    });

    // We need to know which faces and edges a vertex belongs to. We also need
    // a list of all the edges. An edge knows its vertices and faces.
    const edges = [];
    const vertexToEdge = this.positions.map(() => ({}));
    const vertexToFaces = this.positions.map(() => []);
    
    for (let [faceIndex, face] of this.faces.entries()) {
      for (let i = 0; i < face.length; ++i) {
        vertexToFaces[face[i]].push(faceIndex);

        // An edge runs from this vertex to the next along the perimeter.
        let iNext = (i + 1) % face.length;
        let [smaller, bigger] = MathUtilities.order(face[i], face[iNext]);

        // If an edge is shared, between two faces, we'll encounter it more
        // than once. We just grow its faces list on subsequent visits.
        if (vertexToEdge[smaller].hasOwnProperty(bigger)) {
          const edge = vertexToEdge[smaller][bigger];
          if (edge.faces.length === 1) {
            edge.faces.push(faceIndex);
            // console.log(`edge between ${this.positions[edge.vertex0].toString()} and ${this.positions[edge.vertex1].toString()} connects faces ${edge.faces[0]} and ${edge.faces[1]}!`);
          } else {
            throw new Error('too many faces for this edge');
          }
        } else {
          const edge = {
            vertex0: smaller,
            vertex1: bigger,
            faces: [faceIndex],
            centroid: this.positions[smaller].add(this.positions[bigger]).scalarMultiply(0.5),
          };
          edges.push(edge);
          vertexToEdge[smaller][bigger] = edge;
          vertexToEdge[bigger][smaller] = edge;
        }
      }
    }

    // console.log("faceCentroids:", faceCentroids);

    for (let edge of edges) {
      edge.point = Vector3.mean([
        faceCentroids[edge.faces[0]],
        faceCentroids[edge.faces[1]],
        this.positions[edge.vertex0],
        this.positions[edge.vertex1],
      ]);
      // console.log("edge:", edge);
    }

    for (let i = 0; i < this.vertexCount; ++i) {
      const n = vertexToFaces[i].length;
      // TODO magic
      // const m1 = Math.max((n - 3) / n, 0.045);
      const m1 = (n - 3) / n;
      const m2 = 1 / n;
      const m3 = 2 / n;

      const meanFaceCentroid = Vector3.mean(vertexToFaces[i].map(faceIndex => faceCentroids[faceIndex]));
      const incidentEdges = Object.entries(vertexToEdge[i]);
      const meanEdgeCentroid = Vector3.mean(incidentEdges.map(edge => edge[1].centroid));

      console.log("m1:", m1);
      console.log("this.positions[i].toString():", this.positions[i].toString());
      console.log("this.positions[i].scalarMultiply(m1):", this.positions[i].scalarMultiply(m1).toString());

      newPositions.push(
        this.positions[i].scalarMultiply(m1)
          .add(meanFaceCentroid.scalarMultiply(m2))
          .add(meanEdgeCentroid.scalarMultiply(m3))
      );
    }

    for (let edge of edges) {
      edge.pointIndex = newPositions.length;
      newPositions.push(edge.point);
    }

    const faceCentroidIndices = faceCentroids.map(centroid => {
      newPositions.push(centroid);
      return newPositions.length - 1;
    });

    for (let [i, face] of this.faces.entries()) {
      if (face.length === 3) {
        newFaces.push([face[0], vertexToEdge[face[0]][face[1]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[2]][face[0]]]);
        newFaces.push([face[1], vertexToEdge[face[1]][face[2]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[0]][face[1]]]);
        newFaces.push([face[2], vertexToEdge[face[2]][face[0]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[1]][face[2]]]);
      } else if (face.length === 4) {
        newFaces.push([face[0], vertexToEdge[face[0]][face[1]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[3]][face[0]].pointIndex]);
        newFaces.push([face[1], vertexToEdge[face[1]][face[2]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[0]][face[1]].pointIndex]);
        newFaces.push([face[2], vertexToEdge[face[2]][face[3]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[1]][face[2]].pointIndex]);
        newFaces.push([face[3], vertexToEdge[face[3]][face[0]].pointIndex, faceCentroidIndices[i], vertexToEdge[face[2]][face[3]].pointIndex]);
      } else {
        throw new Error('bad face');
      }
    }

    this.positions = newPositions;
    this.faces = newFaces;
  }
}
