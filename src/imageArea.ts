type pixelToPixelFunc = (pixel: Pixel) => void;
type filterPixelFunc = (x: number, y: number) => boolean;

export class Pixel {
  constructor(
    public red: number,
    public green: number,
    public blue: number,
    public alpha: number) { }

  map(transform: pixelToPixelFunc) {
    transform(this);
  }

  copy(): Pixel {
    return new Pixel(this.red, this.green, this.blue, this.alpha);
  }
}

export class PixelArea {
  data: Pixel[][];

  constructor(
    private length: number,
    private height: number) {
    this.length = length;
    this.height = height;
    //contains the pixel data
    this.data = Array(length).fill(Array(height));
  }

  setToImageData(imageData: ImageData, imgLength?: number, imgHeight?: number, xPos = 0, yPos = 0) {
    if (!imgLength)
      imgLength = this.length;
    if (!imgHeight)
      imgHeight = this.height;

    //update data
    let i = 0;
    for (let y = yPos; y < imgHeight; ++y) {
      for (let x = xPos; x < imgLength && i < imageData.data.length; ++x) {
        const pixel = new Pixel(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]);
        this.data[x][y] = pixel;
        const { red, green, blue, alpha } = pixel;
        console.log(red, green, blue, alpha);
        i += 4;
      }
    }
  }

  getImageData(): ImageData {
    const imageData: ImageData = new ImageData(this.length, this.height);


    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.length; ++x) {
        const pixel = this.data[x][y];
        const { red, green, blue, alpha } = pixel;

        const currentImageDataIndex = 4 * (y * this.length + x);
        imageData.data[currentImageDataIndex] = red;
        imageData.data[currentImageDataIndex + 1] = green;
        imageData.data[currentImageDataIndex + 2] = blue;
        imageData.data[currentImageDataIndex + 3] = alpha;
      }
    }

    return imageData;
  }

  getPixel(xPos: number, yPos: number): Pixel {
    if (xPos < this.length && yPos < this.height)
      return this.data[xPos][yPos];

    throw new Error(`getPixel is out of range coord:(${xPos}, ${yPos})`);
  }

  setPixel(xPos: number, yPos: number, pixelValue: Pixel) {
    if (xPos < this.length && yPos < this.height)
      this.data[xPos][yPos] = pixelValue;

    throw new Error(`setPixel is out of range coord:(${xPos}, ${yPos})`);
  }

  transformPixel(xPos: number, yPos: number, transform: pixelToPixelFunc) {
    if (xPos < this.length && yPos < this.height) {
      this.data[xPos][yPos].map(transform);
      return;
    }

    throw new Error(`transformPixel is out of range coord:(${xPos}, ${yPos})`);
  }
}

export class ImageArea {
  pixels: PixelArea;

  constructor(private context: CanvasRenderingContext2D, private xPos: number, private yPos: number, private length: number, private height: number) {
    console.log(xPos, yPos);
    const imageData = context.getImageData(xPos, yPos, length, height);
    this.pixels = new PixelArea(length, height);
    this.pixels.setToImageData(imageData);
  }

  pixelMap(map: pixelToPixelFunc, filter?: filterPixelFunc) {
    for (let x = 0; x < this.length; ++x) {
      for (let y = 0; y < this.height; ++y) {
        if (!filter || filter(x, y)) {
          this.pixels.transformPixel(x, y, map);
        }
      }
    }
  }

  save() {
    const imageData = this.pixels.getImageData();
    this.context.putImageData(imageData, this.xPos, this.yPos);
  }
}