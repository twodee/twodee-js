class Prefab {
  static cube() {
    const positions = [
      new Vector3(0, 0, 1),
      new Vector3(1, 0, 1),
      new Vector3(0, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 1, 0),
      new Vector3(1, 1, 0),
      new Vector3(1, 0, 1),
      new Vector3(1, 0, 0),
      new Vector3(1, 1, 1),
      new Vector3(1, 1, 0),
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(0, 1, 0),
      new Vector3(0, 1, 1),
      new Vector3(0, 1, 1),
      new Vector3(1, 1, 1),
      new Vector3(0, 1, 0),
      new Vector3(1, 1, 0),
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 1),
      new Vector3(1, 0, 1),
    ];

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
}
