class Image {
  constructor(width, height, nchannels, pixels) {
    this.size = new Vector2(width, height);
    this.nchannels = nchannels;
    this.bytes = pixels;
  }

  clone() {
    return new Image(this.width, this.height, this.nchannels, Buffer.from(this.bytes));
  }

  aspectRatio() {
    return this.width / this.height;
  }

  containsPixel(p) {
    return p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height;
  }

  set(c, r, rgb) {
    isDirty = true;
    let start = (r * this.width + c) * 4;
    this.bytes[start + 0] = rgb.r;
    this.bytes[start + 1] = rgb.g;
    this.bytes[start + 2] = rgb.b;
    this.bytes[start + 3] = rgb.a;
  }

  get(c, r) {
    let start = (r * this.width + c) * 4;
    return Color.fromBytes(
      this.bytes[start + 0],
      this.bytes[start + 1],
      this.bytes[start + 2],
      this.bytes[start + 3]
    );
  }

  isPixel(c, r, color) {
    let start = (r * this.width + c) * 4;
    return this.bytes[start + 0] == color.r &&
           this.bytes[start + 1] == color.g &&
           this.bytes[start + 2] == color.b &&
           this.bytes[start + 3] == color.a;
  }

  replace(c, r, newColor) {
    isDirty = true;
    let oldColor = this.get(c, r);

    // Walk through pixels. If pixel is oldColor, replace it.
    for (let rr = 0; rr < this.height; ++rr) {
      for (let cc = 0; cc < this.width; ++cc) {
        if (this.isPixel(cc, rr, oldColor)) {
          drawKnownPixel(new Vector2(cc, rr), newColor);
          history.current.add(cc, rr, newColor.clone());
        }
      }
    }
  }

  fill(c, r, color, isDiagonal = false) {
    isDirty = true;
    let oldColor = this.get(c, r);
    let newColor = color.clone();

    // Bail if this pixel is already the fill color.
    if (this.isPixel(c, r, newColor)) {
      return;
    }

    let stack = [];
    stack.push([c, r]);

    while (stack.length > 0) {
      let [cc, rr] = stack.pop();

      // Move cc as far left as possible.
      while (cc >= 0 && this.isPixel(cc, rr, oldColor)) {
        --cc;
      }
      ++cc;

      let spanAbove = false;
      let spanBelow = false;

      if (isDiagonal && cc > 0) {
        // Look up and left for diagonal.
        if (rr > 0 && this.isPixel(cc - 1, rr - 1, oldColor)) {
          stack.push([cc - 1, rr - 1]);
          spanAbove = true;
        }

        // Look down and left for diagonal.
        if (rr < this.height - 1 && this.isPixel(cc - 1, rr + 1, oldColor)) {
          stack.push([cc - 1, rr + 1]);
          spanBelow = true;
        }
      }

      while (cc < this.width && this.isPixel(cc, rr, oldColor)) {
        drawKnownPixel(new Vector2(cc, rr), color);
        history.current.add(cc, rr, newColor.clone());

        if (!spanAbove && rr > 0 && this.isPixel(cc, rr - 1, oldColor)) {
          stack.push([cc, rr - 1]);
          spanAbove = true;
        } else if (spanAbove && rr > 0 && !this.isPixel(cc, rr - 1, oldColor)) {
          spanAbove = false;
        }

        if (!spanBelow && rr < this.height - 1 && this.isPixel(cc, rr + 1, oldColor)) {
          stack.push([cc, rr + 1]);
          spanBelow = true;
        } else if (spanBelow && rr < this.height - 1 && !this.isPixel(cc, rr + 1, oldColor)) {
          spanBelow = false;
        }

        ++cc;
      }

      if (isDiagonal && cc < this.width - 1) {
        if (!spanAbove && rr > 0 && this.isPixel(cc + 1, rr - 1, oldColor)) {
          stack.push([cc + 1, rr - 1]);
        }

        if (!spanBelow && rr < this.height - 1 && this.isPixel(cc + 1, rr + 1, oldColor)) {
          stack.push([cc + 1, rr + 1]);
        }
      }
    }
  }

  get width() {
    return this.size.x;
  }

  get height() {
    return this.size.y;
  }

  set width(value) {
    this.size.x = value;
  }

  set height(value) {
    this.size.y = value;
  }

  extract(t, r, b, l) {
    isDirty = true;
    let newWidth = this.width - l - r;
    let newHeight = this.height - t - b;
    let newBytes = new Uint8Array(newWidth * newHeight * 4);

    for (let rNew = 0; rNew < newHeight; ++rNew) {
      for (let cNew = 0; cNew < newWidth; ++cNew) {
        let rOld = rNew + t;
        let cOld = cNew + l;
        let iOld = 4 * (rOld * this.width + cOld);
        let iNew = 4 * (rNew * newWidth + cNew);
        for (let ci = 0; ci < 4; ++ci) {
          newBytes[iNew + ci] = this.bytes[iOld + ci];
        }
      }
    }

    this.width = newWidth;
    this.height = newHeight;
    this.bytes = newBytes;
  }

  extend(t, r, b, l) {
    isDirty = true;
    let newWidth = this.width + l + r;
    let newHeight = this.height + t + b;
    let newBytes = new Uint8Array(newWidth * newHeight * 4);

    for (let rOld = 0; rOld < this.height; ++rOld) {
      for (let cOld = 0; cOld < this.width; ++cOld) {
        let rNew = rOld + t;
        let cNew = cOld + l;
        let iOld = 4 * (rOld * this.width + cOld);
        let iNew = 4 * (rNew * newWidth + cNew);
        for (let ci = 0; ci < 4; ++ci) {
          newBytes[iNew + ci] = this.bytes[iOld + ci];
        }
      }
    }

    this.width = newWidth;
    this.height = newHeight;
    this.bytes = newBytes;
  }

  resize(newWidth, newHeight) {
    isDirty = true;
    this.bytes = Buffer.alloc(newWidth * newHeight * 4, 255);
    this.width = newWidth;
    this.height = newHeight;
  }

  shiftWrap(dc, dr) {
    isDirty = true;
    let newBytes = Buffer.alloc(this.width * this.height * 4, 255);
    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        let rr = ((r + dr) % this.height + this.height) % this.height;
        let cc = ((c + dc) % this.width + this.width) % this.width;
        let iOld = 4 * (r * this.width + c);
        let iNew = 4 * (rr * this.width + cc);
        this.bytes.copy(newBytes, iNew, iOld, iOld + 4);
      }
    }
    this.bytes = newBytes;
  }

  resizeDelta(t, r, b, l) {
    isDirty = true;
    this.extract(
      t < 0 ? -t : 0,
      r < 0 ? -r : 0,
      b < 0 ? -b : 0,
      l < 0 ? -l : 0
    );

    this.extend(
      t > 0 ? t : 0,
      r > 0 ? r : 0,
      b > 0 ? b : 0,
      l > 0 ? l : 0
    );
  }

  flipLeftRight() {
    isDirty = true;
    let originalImage = this.clone();
    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        let cc = this.width - 1 - c;
        this.set(c, r, originalImage.get(cc, r));
      }
    }
  }

  flipTopBottom() {
    isDirty = true;
    let originalImage = this.clone();
    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        let rr = this.height - 1 - r;
        this.set(c, r, originalImage.get(c, rr));
      }
    }
  }

  rotateClockwise() {
    isDirty = true;
    let originalImage = this.clone();
    this.resize(this.height, this.width);

    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        this.set(c, r, originalImage.get(r, this.width - 1 - c));
      }
    }
  }

  rotateCounterclockwise() {
    isDirty = true;
    let originalImage = this.clone();
    this.resize(this.height, this.width);

    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        this.set(c, r, originalImage.get(this.height - 1 - r, c));
      }
    }
  }

  rotate180() {
    isDirty = true;
    let originalImage = this.clone();
    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        this.set(c, r, originalImage.get(this.width - 1 - c, this.height - 1 - r));
      }
    }
  }

  outline4(backgroundColor, outlineColor) {
    isDirty = true;
    let originalImage = this.clone();

    for (let r = 0; r < this.height; ++r) {
      for (let c = 0; c < this.width; ++c) {
        if (originalImage.isPixel(c, r, backgroundColor) &&
            ((r > 0 && !originalImage.isPixel(c, r - 1, backgroundColor) && !originalImage.isPixel(c, r - 1, outlineColor)) ||
             (r < this.height - 1 && !originalImage.isPixel(c, r + 1, backgroundColor) && !originalImage.isPixel(c, r + 1, outlineColor)) ||
             (c > 0 && !originalImage.isPixel(c - 1, r, backgroundColor) && !originalImage.isPixel(c - 1, r, outlineColor)) ||
             (c < this.width - 1 && !originalImage.isPixel(c + 1, r, backgroundColor) && !originalImage.isPixel(c + 1, r, outlineColor)))) {
          this.set(c, r, outlineColor);
        }
      }
    }
  }

  isRow(r, color) {
    for (let c = 0; c < this.width; ++c) {
      if (!this.isPixel(c, r, color)) {
        return false;
      }
    }
    return true;
  }

  isColumn(c, color) {
    for (let r = 0; r < this.height; ++r) {
      if (!this.isPixel(c, r, color)) {
        return false;
      }
    }
    return true;
  }

  autocrop(backgroundColor) {
    isDirty = true;
    let l = 0;
    let r = this.width - 1;
    let t = 0;
    let b = this.height - 1;

    while (l < this.width && this.isColumn(l, backgroundColor)) {
      ++l;
    }
    
    if (l == this.width) {
      return;
    }

    while (r >= 0 && this.isColumn(r, backgroundColor)) {
      --r;
    }

    while (t < this.height && this.isRow(t, backgroundColor)) {
      ++t;
    }

    while (b >= 0 && this.isRow(b, backgroundColor)) {
      --b;
    }

    r = this.width - 1 - r;
    b = this.height - 1 - b;

    this.extract(t, r, b, l);
  }
}
