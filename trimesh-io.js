const fs = require('fs');

class TrimeshIO {
  static readObj(path) {
    const text = fs.readFileSync(path, {encoding: 'utf8'});  
    const lines = text.split(/\r?\n/); 
    
    const freePositions = [];
    const freeNormals = [];
    const freeTextureCoordinates = [];
    const faces = [];

    for (let line of lines) {
      const fields = line.split(/ +/);
      if (fields[0] === 'v') {
        freePositions.push(new Vector3(parseFloat(fields[1]), parseFloat(fields[2]), parseFloat(fields[3])));
      } else if (fields[0] === 'vn') {
        freeNormals.push(new Vector3(parseFloat(fields[1]), parseFloat(fields[2]), parseFloat(fields[3])));
      } else if (fields[0] === 'vt') {
        freeTextureCoordinates.push(new Vector2(parseFloat(fields[1]), parseFloat(fields[2])));
      } else if (fields[0] === 'f') {
        for (let i = 1; i < fields.length - 2; ++i) {
          faces.push([fields[1], fields[i + 1], fields[i + 2]]);
        }
      }
    }

    const signatureToVertexIndex = {};
    let vertexIndex = 0;
    let positions = [];
    let normals = [];
    let textureCoordinates = [];
    for (let face of faces) {
      for (let [i, signature] of face.entries()) {
        if (!signatureToVertexIndex.hasOwnProperty(signature)) {
          signatureToVertexIndex[signature] = positions.length;

          const pieces = signature.split(/\//).map(piece => parseInt(piece) - 1);
          positions.push(freePositions[pieces[0]]);
          textureCoordinates.push(freeTextureCoordinates[pieces[1]]);
          normals.push(freeNormals[pieces[2]]);
        }

        face[i] = signatureToVertexIndex[signature];
      }
    }

    return new Trimesh(positions, faces, normals, textureCoordinates);
  }
}