import { NextButton, PreviousButton, SelectedFileName } from '../selectors.js';

export class ImageInfo {
  constructor(getGettersAndSetters) {
    const { getImageData, setImageData, setState, getState } =
      getGettersAndSetters();

    this.getImageData = getImageData;
    this.setImageData = setImageData;
    this.setState = setState;
    this.getState = getState;
    this.previous = PreviousButton;
    this.next = NextButton;
    this.fileName = SelectedFileName;
  }

  init() {
    this.next.addEventListener("click", () => {
      this.setState({
        selectedFileIndex: this.getState().selectedFileIndex + 1,
      });
    });
    this.previous.addEventListener("click", () => {
      this.setState({
        selectedFileIndex: this.getState().selectedFileIndex - 1,
      });
    });
  }

  resizeCanvasToContainer() {
    const containerWidth = this.canvasContainer.clientWidth;
    const containerHeight = this.canvasContainer.clientHeight;
    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;
  }

  redraw() {
    const files = this.getImageData()?.files;
    const numberOfFiles = files?.length;
    const selectedFileIndex = this.getState()?.selectedFileIndex;
    const fileName = files?.[selectedFileIndex]?.name;

    if (
      files.length !== 0 &&
      this.next.hasAttribute("hidden") &&
      this.previous.hasAttribute("hidden")
    ) {
      this.previous.removeAttribute("hidden");
      this.next.removeAttribute("hidden");
    }

    // Update fileName
    const fileNameContent = this.fileName.textContent;
    if (fileNameContent !== fileName) {
      this.fileName.textContent = fileName;
      this.fileName.setAttribute("title", fileName);
    }

    // Update button status
    if (selectedFileIndex === 0 && !this.previous.hasAttribute("disabled")) {
      this.previous.setAttribute("disabled", true);
    }

    if (
      selectedFileIndex === numberOfFiles - 1 &&
      !this.next.hasAttribute("disabled")
    ) {
      this.next.setAttribute("disabled", true);
    }

    if (selectedFileIndex !== 0 && this.previous.hasAttribute("disabled")) {
      this.previous.removeAttribute("disabled");
    }

    if (
      selectedFileIndex !== numberOfFiles - 1 &&
      this.next.hasAttribute("disabled")
    ) {
      this.next.removeAttribute("disabled");
    }

    if (
      files.length === 0 &&
      (!this.next.hasAttribute("hidden") ||
        !this.previous.hasAttribute("hidden"))
    ) {
      this.previous.setAttribute("hidden", true);
      this.next.setAttribute("hidden", true);
    }
  }
}
