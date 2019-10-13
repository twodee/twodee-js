class ShaderProgram {
  constructor(vertexSource, fragmentSource) {
    // Compile.
    this.vertexShader = this.compileSource(gl.VERTEX_SHADER, vertexSource);
    this.fragmentShader = this.compileSource(gl.FRAGMENT_SHADER, fragmentSource);

    // Link.
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);
    gl.linkProgram(this.program);

    let isOkay = gl.getProgramParameter(this.program, gl.LINK_STATUS);
    if (!isOkay) {
      let message = gl.getProgramInfoLog(this.program);
      gl.deleteProgram(this.program);
      throw message;
    }

    this.unbind();
  }

  compileSource(type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let isOkay = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!isOkay) {
      let message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw message;
    }

    return shader;
  }

  getAttributeLocation(name) {
    return gl.getAttribLocation(this.program, name);
  }

  bind() {
    gl.useProgram(this.program);
    this.isBound = true;
  }

  unbind() {
    gl.useProgram(null);
    this.isBound = false;
  }
}
