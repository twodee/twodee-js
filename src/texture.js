class Texture {
  constructor(image) {
    this.image = image;
    this.textureId = Texture.createTexture(this.image.width, this.image.height, this.image.nchannels, this.image.bytes);
  }

  uploadPixel(c, r) {
    gl.texSubImage2D(gl.TEXTURE_2D, 0, c, r, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.image.bytes, (r * this.image.width + c) * 4);
  }

  upload() {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.image.width, this.image.height, 0, this.image.nchannels == 4 ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, this.image.bytes);
  }

  static createTexture(width, height, nchannels, bytes) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, nchannels == 4 ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, bytes);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return texture;
  }
}
