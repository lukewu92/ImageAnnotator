import {
  createImage,
  createImageListItem,
  createSpan,
  ImageListContainer,
  ImagesPanelElement,
  ToggleImagesPanelButton,
  ToggleImagesPanelButtonText,
} from "../selectors.js";
import { removeAllChildNodes } from "../util/element.js";

export class ImagesPanel {
  constructor(getGettersAndSetters) {
    const { getImageData, setImageData, getState, setState } =
      getGettersAndSetters();
    this.getImageData = getImageData;
    this.setImageData = setImageData;
    this.getState = getState;
    this.setState = setState;
    this.imagesPanel = ImagesPanelElement;
    this.toggleImagesPanelButton = ToggleImagesPanelButton;
    this.toggleImagesPanelButtonText = ToggleImagesPanelButtonText;
    this.imageList = ImageListContainer;
    this.prevActiveIndex = null;
    this.previousFilesJSON = null;
    this.previousSelectedFileIndex = null;
  }

  init() {
    this.setState({ initializedImagePanel: true });
    this.previousFilesJSON = JSON.stringify(this.getImageData().files);
    this.toggleImagesPanelButton.addEventListener("click", () => {
      this.setState({
        imagesPanelVisible: !this.getState().imagesPanelVisible,
      });
      this.redraw();
    });
  }

  redraw() {
    const state = this.getState();
    if (!state?.["initializedImagePanel"]) return;
    // Toggle visibility
    const imagesPanelVisible = state.imagesPanelVisible;

    if (imagesPanelVisible && this.imagesPanel.classList.contains("hidden")) {
      this.imagesPanel.classList.remove("hidden");
      this.toggleImagesPanelButtonText.textContent = "Hide Images";
    } else if (
      !imagesPanelVisible &&
      !this.imagesPanel.classList.contains("hidden")
    ) {
      this.imagesPanel.classList.add("hidden");
      this.toggleImagesPanelButtonText.textContent = "Show Images";
    }

    // Handle file list updates
    const files = this.getImageData().files;
    const fileLength = files.length;
    if (this.prevFileLength !== fileLength) {
      this.prevFileLength = fileLength;
      removeAllChildNodes(this.imageList);

      files.forEach((file, index) => {
        const listItem = createImageListItem();
        listItem.dataset.imageFileIndex = index;
        const imageElem = createImage(file.src);
        const textElement = createSpan();
        textElement.textContent = file?.name;
        listItem.appendChild(imageElem);
        listItem.appendChild(textElement);

        listItem.addEventListener("click", () =>
          this.setState({ selectedFileIndex: index })
        );

        this.imageList.appendChild(listItem);
      });
    }

    // Handle file selection
    if (
      files.length > 0 &&
      this.previousSelectedFileIndex !== this.getState()?.selectedFileIndex
    ) {
      this.previousSelectedFileIndex = this.getState()?.selectedFileIndex;
      const allImages = document.querySelectorAll(".image-list-item");
      allImages.forEach((image, index) => {
        if (this.getState()?.selectedFileIndex === index) {
          if (!image?.classList?.contains("active")) {
            image?.classList?.add("active");
          }
        } else {
          if (image?.classList?.contains("active")) {
            image.classList.remove("active");
          }
        }
      });
    }
  }
}
