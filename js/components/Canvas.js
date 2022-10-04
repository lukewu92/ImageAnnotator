import {
  CanvasContainer,
  CanvasElement,
  ClearAllAnnotationButton,
  DeleteImageButton,
  Editor,
  ImageOffset,
  MouseCoordinates,
  MouseLineBottom,
  MouseLineLeft,
  MouseLineRight,
  MouseLineTop,
  MousePosition,
  ResetImagePositionButton,
} from '../selectors.js';
import { startRequestAnimation } from '../util/animationFrame.js';
import { clamp } from '../util/number.js';

export class Canvas {
  constructor(getGettersAndSetters) {
    const {
      getImageData,
      setImageData,
      setState,
      getState,
      getAnnotationData,
      setAnnotationData,
    } = getGettersAndSetters();

    this.getImageData = getImageData;
    this.setImageData = setImageData;
    this.setState = setState;
    this.getState = getState;
    this.getAnnotationData = getAnnotationData;
    this.setAnnotationData = setAnnotationData;

    this.init = this.init.bind(this);
    this.redraw = this.redraw.bind(this);
    this.drawImageToCanvas = this.drawImageToCanvas.bind(this);
    this.drawLines = this.drawLines.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.drawMouseOnImagePosition = this.drawMouseOnImagePosition.bind(this);
    this.hasLeftClicked = this.hasLeftClicked.bind(this);
    this.hasMiddleClicked = this.hasMiddleClicked.bind(this);
    this.clearDefaults = this.clearDefaults.bind(this);
    this.drawRect = this.drawRect.bind(this);
    this.getImageInfo = this.getImageInfo.bind(this);
    this.getMousePositionInfo = this.getMousePositionInfo.bind(this);
    this.getImageAnnotationInfo = this.getImageAnnotationInfo.bind(this);

    this.clearAllAnnotations = ClearAllAnnotationButton;
    this.deleteButton = DeleteImageButton;
    this.editor = Editor;
    this.canvas = CanvasElement;
    this.canvasContainer = CanvasContainer;
    this.mouseCoordinates = MouseCoordinates;
    this.mousePosition = MousePosition;
    this.mouseLineBottom = MouseLineBottom;
    this.mouseLineTop = MouseLineTop;
    this.mouseLineLeft = MouseLineLeft;
    this.mouseLineRight = MouseLineRight;
    this.imageOffset = ImageOffset;
    this.resetImagePositionButton = ResetImagePositionButton;

    this.canvasImage = document.createElement("img");
    this.ctx = this.canvas.getContext("2d");

    // setInterval(this.redraw, 10);
    startRequestAnimation(90, this.redraw);
  }

  clearDefaults() {
    this.setState({
      imageOffset: null,
      mouseDown: null,
      mouseDownPosition: null,
      mouseMiddleDown: null,
      mouseMiddleDownPosition: null,
      temporaryImageOffset: null,
      mouseDownAnnotation: null,
      draggingAnnotationOffset: null,
      temporaryLineOffset: null,
    });
  }

  focusField = (index) => {
    // Check if panel is open, if not, open it
    const annotationsPanelVisible = this.getState()?.annotationsPanelVisible;
    if (!annotationsPanelVisible) {
      this.setState({ annotationsPanelVisible: true });
    }

    // focus field
    const inputField = document.querySelector(
      `[data-annotation-field-index="${index}"]`
    );
    inputField.focus();
  };

  init() {
    // clearAnnotationsFunction =

    this.clearDefaults();
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
      // this.redraw();
    });

    resize_ob.observe(this.canvasContainer);

    // Draws image to canvas on init
    this.canvasImage.addEventListener("load", this.drawImageToCanvas);

    const mouseDownEvent = (e) => {
      let clientX, clientY;
      if (
        e.type == "touchstart" ||
        e.type == "touchmove" ||
        e.type == "touchend" ||
        e.type == "touchcancel"
      ) {
        const touch = e?.changedTouches?.[0];
        clientX = touch?.pageX;
        clientY = touch?.pageY;
      } else if (
        e.type == "mousedown" ||
        e.type == "mouseup" ||
        e.type == "mousemove" ||
        e.type == "mouseover" ||
        e.type == "mouseout" ||
        e.type == "mouseenter" ||
        e.type == "mouseleave"
      ) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      let rect = this.canvas.getBoundingClientRect();
      let x = Math.round(clientX - rect.left);
      let y = Math.round(clientY - rect.top);
      if (e && (e.which == 0 || e.which == 1 || e.button == 0)) {
        const {
          mouseInBoundaryX,
          mouseInBoundaryY,
          isMouseInBoundary,
          annotationsIndexInBoundary,
          insideAnnotationHeight,
          insideAnnotationWidth,
          insideAnnotationX,
          insideAnnotationY,
        } = this.getMousePositionInfo();
        // Select annotation index instead
        if (annotationsIndexInBoundary !== null) {
          this.setState({
            mouseDownAnnotation: {
              index: annotationsIndexInBoundary,
              mouseInBoundaryX,
              mouseInBoundaryY,
              insideAnnotationHeight,
              insideAnnotationWidth,
              insideAnnotationX,
              insideAnnotationY,
            },
            draggingAnnotationOffset: {
              x: 0,
              y: 0,
            },
          });
        } else {
          // Ignore left click if middle click already happened
          if (isMouseInBoundary) {
            this.setState({
              mouseDown: true,
              mouseDownPosition: {
                x,
                y,
                mouseInBoundaryX,
                mouseInBoundaryY,
              },
            });
          }
        }

        // if (!this.hasMiddleClicked()) {
        //   this.setState({
        //     mouseDown: true,
        //     mouseDownPosition: {
        //       x,
        //       y,
        //     },
        //   });
        // }
      }
      if (e && (e.which == 2 || e.button == 4)) {
        // Ignore middle click if left click already happened
        this.setState({
          mouseMiddleDown: true,
          mouseMiddleDownPosition: {
            x,
            y,
          },
        });
        this.canvas.setAttribute("style", "cursor: grab;");
        // if (!this.hasLeftClicked()) {
        //   this.setState({
        //     mouseMiddleDown: true,
        //     mouseMiddleDownPosition: {
        //       x,
        //       y,
        //     },
        //   });

        //   // Show grab cursor when dragging. PS: buggy at the moment, grab cursor doesn't show properly when holding down mouse buttons
        //   this.canvas.setAttribute("style", "cursor: grab;");
        // }
      }
    };

    const mouseMoveEvent = (e) => {
      let clientX, clientY;
      if (
        e.type == "touchstart" ||
        e.type == "touchmove" ||
        e.type == "touchend" ||
        e.type == "touchcancel"
      ) {
        const touch = e?.changedTouches?.[0];
        clientX = touch?.pageX;
        clientY = touch?.pageY;
      } else if (
        e.type == "mousedown" ||
        e.type == "mouseup" ||
        e.type == "mousemove" ||
        e.type == "mouseover" ||
        e.type == "mouseout" ||
        e.type == "mouseenter" ||
        e.type == "mouseleave"
      ) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      // important: correct mouse position:
      let rect = this.canvas.getBoundingClientRect();
      let x = Math.round(clientX - rect.left);
      let y = Math.round(clientY - rect.top);
      this.setState({
        mousePosition: {
          x,
          y,
        },
      });

      // Track user dragging annotations
      if (this.hasClickedOnAnnotation()) {
        const { mouseInBoundaryX, mouseInBoundaryY, imgWidth, imgHeight } =
          this.getMousePositionInfo();
        const mouseDownAnnotation = this.getState()?.mouseDownAnnotation;
        const insideAnnotationX = mouseDownAnnotation.insideAnnotationX;
        const insideAnnotationY = mouseDownAnnotation.insideAnnotationY;
        const insideAnnotationHeight =
          mouseDownAnnotation.insideAnnotationHeight;
        const insideAnnotationWidth = mouseDownAnnotation.insideAnnotationWidth;
        const offsetX = mouseInBoundaryX - mouseDownAnnotation.mouseInBoundaryX;
        const offsetY = mouseInBoundaryY - mouseDownAnnotation.mouseInBoundaryY;
        this.setState({
          draggingAnnotationOffset: {
            x: clamp(
              offsetX,
              -insideAnnotationX,
              imgWidth - insideAnnotationX - insideAnnotationWidth
            ),
            y: clamp(
              offsetY,
              -insideAnnotationY,
              imgHeight - insideAnnotationY - insideAnnotationHeight
            ),
          },
        });
      }
      // Check if user is drawing rects
      if (this.hasLeftClicked()) {
        const initialPosition = this.getState()?.mouseDownPosition;
        const leftX = initialPosition?.x;
        const leftY = initialPosition?.y;
        const offsetX = x - leftX;
        const offsetY = y - leftY;
        this.setState({
          temporaryLineOffset: {
            x: offsetX,
            y: offsetY,
          },
        });
      }

      // Check if user has middle clicked and drag around to apply offsets
      if (this.hasMiddleClicked()) {
        // Get difference between initial position and current position
        const initialPosition = this.getState()?.mouseMiddleDownPosition;
        const middleX = initialPosition?.x;
        const middleY = initialPosition?.y;
        const offsetX = x - middleX;
        const offsetY = y - middleY;
        this.setState({
          temporaryImageOffset: {
            x: offsetX,
            y: offsetY,
          },
        });
      }
    };

    const mouseUpEvent = (e) => {
      const state = this.getState();
      if (e && (e.which == 0 || e.which == 1 || e.button == 0)) {
        const imgInfo = this.getImageInfo();

        // Check if there is box, if so, create a new annotation
        if (this.hasClickedOnAnnotation()) {
          const imageName = this.getImageInfo()?.name;
          const selectedAnnotationIndex =
            this.getState()?.mouseDownAnnotation?.index;
          const draggingAnnotationOffset =
            this.getState()?.draggingAnnotationOffset;

          const annotations = [...this.getAnnotationData()?.[imageName]];
          annotations[selectedAnnotationIndex] = {
            ...annotations[selectedAnnotationIndex],
            x:
              annotations[selectedAnnotationIndex].x +
              draggingAnnotationOffset.x,
            y:
              annotations[selectedAnnotationIndex].y +
              draggingAnnotationOffset.y,
          };
          // Update annotation data
          this.setAnnotationData({ [imageName]: annotations });

          this.focusField(selectedAnnotationIndex);
        }
        if (
          state.mouseDownPosition &&
          JSON.stringify(state.mousePosition) !==
            JSON.stringify(state.mouseDownPosition)
        ) {
          const { mouseInBoundaryX, mouseInBoundaryY, imgWidth, imgHeight } =
            this.getMousePositionInfo();

          let annotationX = state.mouseDownPosition.mouseInBoundaryX;
          let annotationY = state.mouseDownPosition.mouseInBoundaryY;

          let rectWidth =
            mouseInBoundaryX - state.mouseDownPosition.mouseInBoundaryX;
          let rectHeight =
            mouseInBoundaryY - state.mouseDownPosition.mouseInBoundaryY;

          // Handle negative for when user draw line backwards
          if (rectWidth < 0) {
            annotationX += rectWidth;
            rectWidth = Math.abs(rectWidth);
          }

          if (rectHeight < 0) {
            annotationY += rectHeight;
            rectHeight = Math.abs(rectHeight);
          }

          if (rectWidth > 0 && rectHeight > 0) {
            const oldData = this.getAnnotationData()?.[imgInfo.name] || [];
            this.setAnnotationData({
              [imgInfo.name]: [
                ...oldData,
                {
                  label: "",
                  x: annotationX,
                  y: annotationY,
                  width: rectWidth,
                  height: rectHeight,
                },
              ],
            });

            this.focusField(oldData.length);
          }
        }

        this.setState({
          mouseDown: null,
          mouseDownPosition: null,
          mouseDownAnnotation: null,
          draggingAnnotationOffset: null,
        });
      }

      if (e && (e.which == 2 || e.button == 4)) {
        this.setState({
          mouseMiddleDown: null,
          mouseMiddleDownPosition: null,
        });

        // Unset cursor
        this.canvas.setAttribute("style", "cursor: auto;");

        if (state?.temporaryImageOffset) {
          const temporaryOffset = this.getState()?.temporaryImageOffset;
          const initialOffset = this.getState()?.imageOffset || {
            x: 0,
            y: 0,
          };
          this.setState({
            temporaryImageOffset: null,
            imageOffset: {
              x: initialOffset.x + temporaryOffset.x,
              y: initialOffset.y + temporaryOffset.y,
            },
          });
        }
      }
    };

    // Reset offset button
    this.resetImagePositionButton.addEventListener("click", () =>
      this.setState({ imageOffset: null })
    );

    // On mouse down
    this.canvas.onmousedown = mouseDownEvent;
    this.canvas.addEventListener("touchstart", mouseDownEvent);

    // Add mouseover event on canvas to detect mouse movement on canvas
    this.canvas.onmousemove = mouseMoveEvent;
    this.canvas.addEventListener("touchmove", mouseMoveEvent);

    this.canvas.onmouseup = mouseUpEvent;
    this.canvas.addEventListener("touchend", mouseUpEvent);
  }

  hasClickedOnAnnotation() {
    return this.getState()?.mouseDownAnnotation;
  }

  hasMiddleClicked() {
    return this.getState()?.mouseMiddleDown;
  }

  hasLeftClicked() {
    return this.getState()?.mouseDown;
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

  drawImageToCanvas() {
    const offset = this.getState()?.imageOffset;
    const temporaryOffset = this.getState()?.temporaryImageOffset;
    let offsetX = 0;
    let offsetY = 0;

    if (offset || temporaryOffset) {
      offsetX = (offset?.x || 0) + (temporaryOffset?.x || 0);
      offsetY = (offset?.y || 0) + (temporaryOffset?.y || 0);
    }

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.drawImage(
      this.canvasImage,
      width / 2 - this.canvasImage.width / 2 + offsetX,
      height / 2 - this.canvasImage.height / 2 + offsetY
    );

    const imageOffsetContent = `Image Offset (x: ${offsetX}, y: ${offsetY})`;
    if (imageOffsetContent !== this.imageOffset.textContent) {
      this.imageOffset.textContent = imageOffsetContent;
    }
  }

  drawRect(
    initialX,
    initialY,
    offsetX,
    offsetY,
    label = null,
    highlight = null
  ) {
    const { minBoundaryX, minBoundaryY } = this.getMousePositionInfo();
    const rectX = minBoundaryX + initialX;
    const rectY = minBoundaryY + initialY;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.fillStyle = highlight ? "#ffffff26" : "#d948ef26";
    ctx.fillRect(rectX, rectY, offsetX, offsetY);

    ctx.strokeStyle = highlight ? "#ffffff" : "#d948ef";
    ctx.lineWidth = 2;
    ctx.strokeRect(rectX, rectY, offsetX, offsetY);
  }

  getImageAnnotationInfo() {
    const imageName = this.getImageInfo()?.name;
    return this.getAnnotationData()?.[imageName];
  }

  getSelectedAnnotationIndex = () => {
    return this.getAnnotationData()?.selectedAnnotationIndex;
  };

  getImageInfo() {
    const files = this.getImageData()?.files;
    const selectedFileIndex = this.getState()?.selectedFileIndex;
    return files[selectedFileIndex];
  }

  getMousePositionInfo() {
    const state = this.getState();
    const selectedImageInfo = this.getImageInfo();
    const annotations = this.getImageAnnotationInfo();

    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const imgWidth = selectedImageInfo?.width;
    const imgHeight = selectedImageInfo?.height;
    let imgOffsetX = state?.imageOffset?.x || 0;
    let imgOffsetY = state?.imageOffset?.y || 0;
    imgOffsetX += state?.temporaryImageOffset?.x || 0;
    imgOffsetY += state?.temporaryImageOffset?.y || 0;
    const canvasHalfWidth = canvasWidth / 2;
    const canvasHalfHeight = canvasHeight / 2;
    const imgHalfWidth = imgWidth / 2;
    const imgHalfHeight = imgHeight / 2;
    const imageXPosition = canvasHalfWidth - imgHalfWidth + imgOffsetX;
    const imageYPosition = canvasHalfHeight - imgHalfHeight + imgOffsetY;
    const minBoundaryX = imageXPosition;
    const maxBoundaryX = imageXPosition + imgWidth;
    const minBoundaryY = imageYPosition;
    const maxBoundaryY = imageYPosition + imgHeight;
    const mousePosition = state?.mousePosition;
    const mX = mousePosition.x;
    const mY = mousePosition.y;

    const isMouseInBoundary =
      mX >= minBoundaryX - 12 &&
      mX <= maxBoundaryX + 12 &&
      mY >= minBoundaryY - 12 &&
      mY <= maxBoundaryY + 12;

    const mouseInBoundaryX = clamp(Math.round(mX - minBoundaryX), 0, imgWidth);
    const mouseInBoundaryY = clamp(Math.round(mY - minBoundaryY), 0, imgHeight);

    let annotationsIndexInBoundary = null;
    let insideAnnotationX = null;
    let insideAnnotationY = null;
    let insideAnnotationWidth = null;
    let insideAnnotationHeight = null;
    // Check what is the last annotations mouse is in boundary with
    if (annotations?.length > 0) {
      for (let i = annotations.length - 1; i >= 0; i--) {
        if (
          mouseInBoundaryX >= annotations[i].x &&
          mouseInBoundaryX <= annotations[i].x + annotations[i].width &&
          mouseInBoundaryY >= annotations[i].y &&
          mouseInBoundaryY <= annotations[i].y + annotations[i].height
        ) {
          annotationsIndexInBoundary = i;
          insideAnnotationWidth = annotations[i].width;
          insideAnnotationHeight = annotations[i].height;
          insideAnnotationX = annotations[i]?.x;
          insideAnnotationY = annotations[i]?.y;
        }
      }
    }

    return {
      mX,
      mY,
      imgWidth,
      imgHeight,
      minBoundaryX,
      maxBoundaryX,
      minBoundaryY,
      maxBoundaryY,
      mouseInBoundaryX,
      mouseInBoundaryY,
      isMouseInBoundary,
      mousePosition,
      annotationsIndexInBoundary,
      insideAnnotationX,
      insideAnnotationY,
      insideAnnotationHeight,
      insideAnnotationWidth,
    };
  }

  drawLines() {
    // Draw pointer on canvas to show X and Y coordinates of mouse position
    const {
      isMouseInBoundary,
      mouseInBoundaryX,
      mouseInBoundaryY,
      mousePosition,
      minBoundaryX,
      maxBoundaryX,
      minBoundaryY,
      maxBoundaryY,
      imgWidth,
      imgHeight,
    } = this.getMousePositionInfo();
    const selectedImageInfo = this.getImageInfo();
    const state = this.getState();

    // Draw rect of user holding left click
    if (
      this.hasLeftClicked() &&
      state.mouseDownPosition.x !== state.mousePosition.x &&
      state.mouseDownPosition.y !== state.mousePosition.y
    ) {
      console.log("hasLeftClicked");
      const mouseDownPosition = state?.mouseDownPosition;
      const temporaryLineOffset = state?.temporaryLineOffset;
      const initialX = mouseDownPosition.mouseInBoundaryX;
      const initialY = mouseDownPosition.mouseInBoundaryY;
      const offsetX = clamp(
        temporaryLineOffset.x,
        0 - mouseDownPosition.x,
        imgWidth
      );
      const offsetY = clamp(
        temporaryLineOffset.y,
        0 - mouseDownPosition.y,
        imgHeight
      );
      console.log("offsetY", offsetY);
      this.drawRect(initialX, initialY, offsetX, offsetY);
    }

    // Show coordinates
    const oldTextContent = this.mouseCoordinates.textContent;
    const newTextContent = `x: ${mouseInBoundaryX}, y: ${mouseInBoundaryY}`;
    if (oldTextContent !== newTextContent) {
      this.mouseCoordinates.textContent = newTextContent;
    }

    // Update coordinates element with crosshair
    const oldMousePositionStyle = this.mousePosition.getAttribute("style");
    const newMousePositionStyle = `transform: translate(${mousePosition?.x}px, ${mousePosition?.y}px);`;
    if (oldMousePositionStyle !== newMousePositionStyle) {
      this.mousePosition.setAttribute("style", newMousePositionStyle);
    }

    if (isMouseInBoundary && this.mousePosition.hasAttribute("hidden")) {
      this.mousePosition.removeAttribute("hidden");
      // Hide cursor because crosshair is showing
      this.canvasContainer.setAttribute("style", "cursor: none;");
    }

    if (!isMouseInBoundary && !this.mousePosition.hasAttribute("hidden")) {
      this.mousePosition.setAttribute("hidden", true);
      // Show cursor
      this.canvasContainer.setAttribute("style", "cursor: auto;");
    }

    // Redraw drawn rects
    const imageAnnotations = this.getImageAnnotationInfo();
    if (imageAnnotations?.length > 0) {
      const mouseDownAnnotationIndex =
        this.getState()?.mouseDownAnnotation?.index;
      const draggingAnnotationOffset =
        this.getState()?.draggingAnnotationOffset;
      imageAnnotations?.forEach(({ label, x, y, width, height }, index) => {
        let rectX = x;
        let rectY = y;
        if (mouseDownAnnotationIndex === index) {
          rectX += draggingAnnotationOffset?.x;
          rectY += draggingAnnotationOffset?.y;
        }
        this.drawRect(
          rectX,
          rectY,
          width,
          height,
          label,
          this.getState()?.mouseDownAnnotation?.index === index ||
            this.getSelectedAnnotationIndex() === index
        );
      });
    }
  }

  redraw() {
    this.clearCanvas();
    const state = this.getState();
    const imageAnnotationInfo = this.getImageAnnotationInfo();
    const imageData = this.getImageData();
    const selectedFile =
      this.getImageData()?.files[this.getState()?.selectedFileIndex];

    if (selectedFile && this?.canvasImage?.src !== selectedFile.src) {
      this.canvasImage.src = selectedFile.src;
    }

    if (selectedFile) {
      if (this.editor.classList.contains("invisible")) {
        this.editor.classList.remove("invisible");
      }
      this.drawImageToCanvas();
      this.drawLines();
    } else {
      if (!this.editor.classList.contains("invisible")) {
        this.editor.classList.add("invisible");
      }
    }

    if (
      !imageData?.files?.length &&
      !this.deleteButton?.hasAttribute("hidden")
    ) {
      this.deleteButton.setAttribute("hidden", true);
    }

    if (imageData?.files?.length && this.deleteButton?.hasAttribute("hidden")) {
      this.deleteButton.removeAttribute("hidden");
    }

    if (
      !imageAnnotationInfo?.length &&
      !this.clearAllAnnotations?.hasAttribute("hidden")
    ) {
      this.clearAllAnnotations?.setAttribute("hidden", true);
    }

    if (
      imageAnnotationInfo?.length &&
      this.clearAllAnnotations?.hasAttribute("hidden")
    ) {
      this.clearAllAnnotations?.removeAttribute("hidden");
    }
  }
}
