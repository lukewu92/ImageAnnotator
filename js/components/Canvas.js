import {
  CanvasContainer,
  CanvasElement,
  MouseCoordinates,
  MouseLineBottom,
  MouseLineLeft,
  MouseLineRight,
  MouseLineTop,
  MousePosition,
} from '../selectors.js';

export class Canvas {
  constructor(getGettersAndSetters) {
    const { getImageData, setImageData, setState, getState } =
      getGettersAndSetters();

    this.getImageData = getImageData;
    this.setImageData = setImageData;
    this.setState = setState;
    this.getState = getState;

    this.init = this.init.bind(this);
    this.drawImageToCenter = this.drawImageToCenter.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.drawMouseOnImagePosition = this.drawMouseOnImagePosition.bind(this);

    this.canvas = CanvasElement;
    this.canvasContainer = CanvasContainer;
    this.mouseCoordinates = MouseCoordinates;
    this.mousePosition = MousePosition;
    this.mouseLineBottom = MouseLineBottom;
    this.mouseLineTop = MouseLineTop;
    this.mouseLineLeft = MouseLineLeft;
    this.mouseLineRight = MouseLineRight;

    this.canvasImage = document.createElement("img");
    this.ctx = this.canvas.getContext("2d");
  }

  init() {
    // Detect size changes for element, works better than window.onresize
    const resize_ob = new ResizeObserver((entries) => {
      let rect = entries[0].contentRect;
      // Set canvas to match container size
      let width = rect.width;
      let height = rect.height;
      this.canvas.width = width;
      this.canvas.height = height;

      // Set mouse position lines
      this.mouseLineTop.setAttribute("style", `height: ${height}px;`);
      this.mouseLineBottom.setAttribute("style", `height: ${height}px;`);
      this.mouseLineLeft.setAttribute("style", `width: ${width}px;`);
      this.mouseLineRight.setAttribute("style", `width: ${width}px;`);
      this.redraw();
    });

    resize_ob.observe(this.canvasContainer);

    // Draws image to canvas on init
    this.canvasImage.addEventListener("load", this.drawImageToCenter);

    // Add mouseover event on canvas to detect mouse movement on canvas
    this.canvas.onmousemove = (e) => {
      // important: correct mouse position:
      let rect = this.canvas.getBoundingClientRect();
      let x = Math.round(e.clientX - rect.left);
      let y = Math.round(e.clientY - rect.top);
      // console.log("rect", rect);
      // console.log("x", x);
      // console.log("y", y);
      const oldTextContent = this.mouseCoordinates.textContent;
      const newTextContent = `x: ${Math.round(x)}, y: ${Math.round(y)}`;
      if (oldTextContent !== newTextContent) {
        this.mouseCoordinates.textContent = newTextContent;
      }

      const oldMousePositionStyle = this.mousePosition.getAttribute("style");
      const newMousePositionStyle = `transform: translate(${x}px, ${y}px);`;
      if (oldMousePositionStyle !== newMousePositionStyle) {
        this.mousePosition.setAttribute("style", newMousePositionStyle);
      }
      // this.drawMouseOnImagePosition(x, y);
    };
  }

  drawMouseOnImagePosition(x, y) {
    const radius = 4;
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImageToCenter() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.drawImage(
      this.canvasImage,
      width / 2 - this.canvasImage.width / 2,
      height / 2 - this.canvasImage.height / 2
    );
  }

  redraw() {
    const selectedFile =
      this.getImageData()?.files[this.getState()?.selectedFileIndex];

    if (selectedFile && this?.canvasImage?.src !== selectedFile.src) {
      this.clearCanvas();
      this.canvasImage.src = selectedFile.src;
    }

    this.drawImageToCenter();
  }
}
