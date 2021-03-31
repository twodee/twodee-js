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
}

