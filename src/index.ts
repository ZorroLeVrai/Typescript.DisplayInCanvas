import { ImageArea, Pixel } from "./imageArea";

const imageFile = "./fake.png";

const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;

window.onload = main;

function main() {
  canvasElement.addEventListener("click", updateMousePosition(canvasElement.getBoundingClientRect()));

  //the willReadFrequently option is used to say that we will use getImageData and putImageData frequently
  const context = canvasElement.getContext('2d', { willReadFrequently: true });

  const myImage = new Image();
  myImage.src = imageFile;
  myImage.onload = displayImage(myImage, 0, 0);


  function updateMousePosition(offset: DOMRect) {
    function localUpdateMousePosition(event: MouseEvent) {
      const positionX = Math.round(event.clientX - offset.left);
      const positionY = Math.round(event.clientY - offset.top);
      makeAreaRed(positionX, positionY, 5, 20);
    }

    return localUpdateMousePosition;
  }

  function displayImage(img: HTMLImageElement, x: number, y: number) {
    return () => context?.drawImage(img, x, y);
  }

  function makeAreaRed(x: number, y: number, length: number, height: number) {
    if (!context)
      throw new Error("Context not initialized");

    const changeRed = (pixel: Pixel) => {
      //TODO: effet de bord ?
      pixel.red = (pixel.red + 128) % 256;
      pixel.red = 0;
      pixel.green = 0;
      pixel.blue = 0;
    }

    const imageArea = new ImageArea(context, x, y, length, height);
    imageArea.pixelMap(changeRed);
    imageArea.save();
  }
}