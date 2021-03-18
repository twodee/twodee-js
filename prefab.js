import {Trimesh} from './trimesh.js';
import {Vector3} from './vector.js';

export class Prefab {
  static cube(size = 1, origin = new Vector3(0, 0, 0)) {
    const positions = [

      // Front
      new Vector3(-0.5, -0.5,  0.5),
      new Vector3( 0.5, -0.5,  0.5),
      new Vector3(-0.5,  0.5,  0.5),
      new Vector3( 0.5,  0.5,  0.5),

      // Back
      new Vector3( 0.5, -0.5, -0.5),
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3( 0.5,  0.5, -0.5),
      new Vector3(-0.5,  0.5, -0.5),

      // Right
      new Vector3( 0.5, -0.5,  0.5),
      new Vector3( 0.5, -0.5, -0.5),
      new Vector3( 0.5,  0.5,  0.5),
      new Vector3( 0.5,  0.5, -0.5),

      // Left
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3(-0.5, -0.5,  0.5),
      new Vector3(-0.5,  0.5, -0.5),
      new Vector3(-0.5,  0.5,  0.5),

      // Top
      new Vector3(-0.5,  0.5,  0.5),
      new Vector3( 0.5,  0.5,  0.5),
      new Vector3(-0.5,  0.5, -0.5),
      new Vector3( 0.5,  0.5, -0.5),

      // Bottom
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3( 0.5, -0.5, -0.5),
      new Vector3(-0.5, -0.5,  0.5),
      new Vector3( 0.5, -0.5,  0.5),
    ].map(p => p.scalarMultiply(size).add(origin));

    const normals = [
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, -1),
      new Vector3(0, 0, -1),
      new Vector3(0, 0, -1),
      new Vector3(0, 0, -1),
      new Vector3(1, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(-1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, -1, 0),
      new Vector3(0, -1, 0),
      new Vector3(0, -1, 0),
      new Vector3(0, -1, 0),
    ];

    const faces = [
      [0, 1, 3],
      [0, 3, 2],
      [5, 4, 6],
      [5, 6, 7],
      [8, 9, 11],
      [8, 11, 10],
      [12, 13, 15],
      [12, 15, 14],
      [16, 17, 19],
      [16, 19, 18],
      [20, 21, 23],
      [20, 23, 22],
    ];

    return new Trimesh(positions, faces, normals);
  }

  static sphere(radius, origin, sliceCount, stackCount) {
    const stackDelta = Math.PI / (stackCount + 2);
    const sliceDelta = 2.0 * Math.PI / sliceCount;

    // Positions

    const positions = [];

    // Add latitude/longitude pairs.
    let stackAt = stackDelta;
    for (let r = 0; r <= stackCount; ++r, stackAt += stackDelta) {
      let sliceAt = 0;
      for (let c = 0; c < sliceCount; ++c, sliceAt += sliceDelta) {
        positions.push(new Vector3(
          radius * Math.cos(sliceAt) * Math.sin(stackAt),
          radius *                     Math.cos(stackAt),
          radius * Math.sin(sliceAt) * Math.sin(stackAt)
        ).add(origin));
      }
    }

    // Add top and bottom.
    positions.push(new Vector3(0, radius, 0).add(origin));
    positions.push(new Vector3(0, -radius, 0).add(origin));

    // Faces
    const faces = [];

    // Connect up latitude/longitude grid.
    for (let r = 0; r < stackCount; ++r) {
      for (let c = 0; c < sliceCount; ++c) {
        const nextR = (r + 1) % (stackCount + 1);
        const nextC = (c + 1) % (sliceCount + 0);

        const faceA = [
          r * sliceCount + c,
          r * sliceCount + nextC,
          nextR * sliceCount + c,
        ];

        const faceB = [
          faceA[2],
          faceA[1],
          nextR * sliceCount + nextC,
        ];

        faces.push(faceA, faceB);
      }
    }

    // Incorporate the bottom and top.
    const topIndex = sliceCount * (stackCount + 1);
    const bottomIndex = sliceCount * (stackCount + 1) + 1;
    for (let c = 0; c < sliceCount; ++c) {
      const faceA = [
        (c + 1) % sliceCount,
        c,
        topIndex,
      ];

      const faceB = [
        stackCount * sliceCount + c,
        stackCount * sliceCount + (c + 1) % sliceCount,
        bottomIndex,
      ];

      faces.push(faceA, faceB);
    }

    return new Trimesh(positions, faces);
  }

  static quadrilateral(size = 1, origin = new Vector3(0, 0, 0)) {
    const positions = [
      new Vector3(-0.5, -0.5, 0),
      new Vector3( 0.5, -0.5, 0),
      new Vector3(-0.5,  0.5, 0),
      new Vector3( 0.5,  0.5, 0),
    ].map(p => p.scalarMultiply(size).add(origin));

    const normals = [
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 1),
    ];

    const faces = [
      [0, 1, 3],
      [0, 3, 2],
    ];

    return new Trimesh(positions, faces, normals);
  }
}
