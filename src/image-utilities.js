export class ImageUtilities {
  static htmlImageToGrays(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    const pixels = context.getImageData(0, 0, image.width, image.height);
    const grays = new Array(image.width * image.height);
    for (let i = 0; i < image.width * image.height; ++i) {
      grays[i] = pixels.data[i * 4];
    }
    return {grays, width: image.width, height: image.height};
  }

  static checkerboard(colorA, colorB, checkSize = 1) {
    const width = checkSize * 2;
    const height = checkSize * 2;
    const pixels = new Uint8Array(width * height * 4);
    for (let r = 0; r < height; ++r) {
      for (let c = 0; c < width; ++c) {
        const color = (r < checkSize === c < checkSize) ? colorA : colorB;
        pixels[(r * width + c) * 4 + 0] = color.r;
        pixels[(r * width + c) * 4 + 1] = color.g;
        pixels[(r * width + c) * 4 + 2] = color.b;
        pixels[(r * width + c) * 4 + 3] = 255;
      }
    }
    return {pixels, width, height};
  }
}

