class VertexAttribute {
  constructor(name, nvertices, ncomponents, floats, usage = gl.STATIC_DRAW) {
    this.name = name;
    this.nvertices = nvertices;
    this.ncomponents = ncomponents;

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floats), usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}

class VertexAttributes {
  constructor() {
    this.nvertices = -1;
    this.indexBuffer = null;
    this.attributes = [];
  }

  addAttribute(name, nvertices, ncomponents, floats, usage = gl.STATIC_DRAW) {
    if (this.nvertices >= 0 && nvertices != this.nvertices) {
      throw "Attributes must have same number of vertices.";
    }

    this.nvertices = nvertices;
    let attribute = new VertexAttribute(name, nvertices, ncomponents, floats, usage);
    this.attributes.push(attribute);
  }

  // addIndices(ints, usage) {
    // this.indexBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  // }

  [Symbol.iterator]() {
    return this.attributes.values();
  }

  get vertexCount() {
    return this.nvertices;
  }
}
