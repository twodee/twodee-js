import {Trimesh} from './trimesh.js';
import {Quadmesh} from './quadmesh.js';
import {Vector3} from './vector.js';
import {Matrix4} from './matrix.js';
import {MathUtilities} from './math-utilities.js';

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
      [4, 5, 7],
      [4, 7, 6],
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

  static cube8(size = 1, origin = new Vector3(0, 0, 0)) {
    const positions = [
      new Vector3(-0.5, -0.5,  0.5),
      new Vector3( 0.5, -0.5,  0.5),
      new Vector3(-0.5,  0.5,  0.5),
      new Vector3( 0.5,  0.5,  0.5),
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3( 0.5, -0.5, -0.5),
      new Vector3(-0.5,  0.5, -0.5),
      new Vector3( 0.5,  0.5, -0.5),
    ].map(p => p.scalarMultiply(size).add(origin));

    const faces = [
      // Front
      [0, 1, 2],
      [1, 3, 2],

      // Back
      [5, 4, 7],
      [4, 6, 7],

      // Right
      [1, 5, 3],
      [5, 7, 3],

      // Left
      [4, 0, 6],
      [0, 2, 6],

      // Top
      [2, 3, 6],
      [3, 7, 6],

      // Bottom
      [4, 5, 0],
      [5, 1, 0],
    ];

    const texcoords = [
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(1, 1, 0),

      new Vector3(0, 0, 1),
      new Vector3(1, 0, 1),
      new Vector3(0, 1, 1),
      new Vector3(1, 1, 1),
    ];

    return new Trimesh(positions, faces, null, {texcoords});
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

  static torus(innerRadius, outerRadius, nlatitudes, nlongitudes) {
    const radius = outerRadius - innerRadius;
    const centerX = (innerRadius + outerRadius) * 0.5;

    const positions = [];
    const normals = [];
    const faces = [];
    for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
      let longitude = ilongitude / nlongitudes * 2 * Math.PI; 
      const iNextLongitude = (ilongitude + 1) % nlongitudes;
      for (let ilatitude = 0; ilatitude < nlatitudes; ++ilatitude) {
        let latitude = ilatitude / nlatitudes * 2 * Math.PI;
        const iNextLatitude = (ilatitude + 1) % nlatitudes;

        const unrotatedX = radius * Math.cos(latitude) + centerX;
        const unrotatedY = radius * Math.sin(latitude);
        const position = new Vector3(
          unrotatedX * Math.cos(longitude),
          unrotatedY,
          unrotatedX * Math.sin(longitude),
        );
        positions.push(position);

        const normal = new Vector3(
          Math.cos(latitude) * Math.cos(longitude),
          Math.sin(latitude),
          Math.cos(latitude) * Math.sin(longitude),
        );
        normals.push(normal);

        faces.push([
          ilongitude * nlatitudes + ilatitude,
          ilongitude * nlatitudes + iNextLatitude,
          iNextLongitude * nlatitudes + ilatitude,
        ]);
        faces.push([
          ilongitude * nlatitudes + iNextLatitude,
          iNextLongitude * nlatitudes + iNextLatitude,
          iNextLongitude * nlatitudes + ilatitude,
        ]);
      }
    }

    return new Trimesh(positions, faces, normals);
  }

  static quadCube8(size = 1, origin = new Vector3(0, 0, 0)) {
    const positions = [
      new Vector3(-0.5, -0.5,  0.5),
      new Vector3( 0.5, -0.5,  0.5),
      new Vector3(-0.5,  0.5,  0.5),
      new Vector3( 0.5,  0.5,  0.5),
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3( 0.5, -0.5, -0.5),
      new Vector3(-0.5,  0.5, -0.5),
      new Vector3( 0.5,  0.5, -0.5),
    ].map(p => p.scalarMultiply(size).add(origin));

    const faces = [
      // Front
      [0, 1, 3, 2],

      // Back
      [5, 4, 6, 7],

      // Right
      [1, 5, 7, 3],

      // Left
      [4, 0, 2, 6],

      // Top
      [2, 3, 7, 6],

      // Bottom
      [4, 5, 1, 0],
    ];

    const texcoords = [
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(1, 1, 0),

      new Vector3(0, 0, 1),
      new Vector3(1, 0, 1),
      new Vector3(0, 1, 1),
      new Vector3(1, 1, 1),
    ];

    return new Quadmesh(positions, faces, null, {texcoords});
  }

  static cylinder(from, to, fromRadius, toRadius, nlatitudes, nlongitudes) {
    const positions = [];
    // const normals = [];
    const faces = [];
    const height = from.distance(to);

    for (let ilatitude = 0; ilatitude < nlatitudes; ++ilatitude) {
      const y = ilatitude / (nlatitudes - 1) * height;
      const radius = MathUtilities.lerp(fromRadius, toRadius, ilatitude / (nlatitudes - 1));
      for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
        let radians = ilongitude / nlongitudes * 2 * Math.PI;
        const x = radius * Math.cos(radians);
        const z = radius * Math.sin(radians);
        positions.push(new Vector3(x, y, z));
      }
    }

    // From cap
    for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
      let radians = ilongitude / nlongitudes * 2 * Math.PI;
      const x = fromRadius * Math.cos(radians);
      const z = fromRadius * Math.sin(radians);
      positions.push(new Vector3(x, 0, z));
    }

    // To cap
    for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
      let radians = ilongitude / nlongitudes * 2 * Math.PI;
      const x = toRadius * Math.cos(radians);
      const z = toRadius * Math.sin(radians);
      positions.push(new Vector3(x, height, z));
    }

    positions.push(new Vector3(0, 0, 0));
    positions.push(new Vector3(0, height, 0));

    for (let ilatitude = 0; ilatitude < nlatitudes - 1; ++ilatitude) {
      const iNextLatitude = ilatitude + 1;
      for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
        const iNextLongitude = (ilongitude + 1) % nlongitudes;
        
        faces.push([
          ilatitude * nlongitudes + ilongitude,
          iNextLatitude * nlongitudes + ilongitude,
          ilatitude * nlongitudes + iNextLongitude,
        ]);

        faces.push([
          ilatitude * nlongitudes + iNextLongitude,
          iNextLatitude * nlongitudes + ilongitude,
          iNextLatitude * nlongitudes + iNextLongitude,
        ]);
      }
    }

    const fromCenterIndex = positions.length - 2;
    const toCenterIndex = positions.length - 1;
    let baseIndex = nlatitudes * nlongitudes;

    for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
      const iNextLongitude = (ilongitude + 1) % nlongitudes;
      faces.push([
        fromCenterIndex,
        baseIndex + ilongitude,
        baseIndex + iNextLongitude,
      ]);
      faces.push([
        toCenterIndex,
        baseIndex + nlongitudes + iNextLongitude,
        baseIndex + nlongitudes + ilongitude,
      ]);
    }

    const mesh = new Trimesh(positions, faces);

    const direction = to.subtract(from).normalize();
    if (direction.y < 1) {
      const degrees = Math.acos(direction.y) * 180 / Math.PI;
      const axis = Vector3.up().cross(direction).normalize();
      const transformation = Matrix4.rotate(axis, degrees);
      mesh.transform(transformation);
    }

    mesh.transform(Matrix4.translate(from.x, from.y, from.z));

    return mesh;
  }
}
