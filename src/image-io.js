export class ImageIO {
  static async readFromUrl(url) {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }

  static async readFromUrls(urls) {
    return Promise.all(urls.map(url => ImageIO.readFromUrl(url)));
  }
}
