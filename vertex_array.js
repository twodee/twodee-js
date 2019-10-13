class VertexArray {
  constructor(program, attributes) {
    this.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(this.vertexArray);
    for (let attribute of attributes) {
      let location = program.getAttributeLocation(attribute.name);
      console.log("location:", location);
      if (location < 0) {
        console.log(`${attribute.name} is not used in the shader.`);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
        console.log("attribute.ncomponents:", attribute.ncomponents);
        gl.vertexAttribPointer(location, attribute.ncomponents, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
      }
    }

    // this.unbind();
  }

  bind() {
    gl.bindVertexArray(this.vertexArray);
    this.isBound = true;
  }

  unbind() {
    gl.bindVertexArray(null);
    this.isBound = false;
  }

  drawSequence(mode) {
    console.log("attributes.vertexCount:", attributes.vertexCount);
    gl.drawArrays(mode, 0, attributes.vertexCount);
  }
}
