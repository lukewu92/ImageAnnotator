import {
  createImage,
  createImageListItem,
  ImageListContainer,
  ImagesPanelElement,
  ToggleImagesPanelButton,
} from '../selectors.js';
import { removeAllChildNodes } from '../util/element.js';

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
    this.imageList = ImageListContainer;
    this.prevActiveIndex = null;
    this.previousFilesJSON = null;
    this.previousSelectedFileIndex = null;
  }

  init() {
    this.previousFilesJSON = JSON.stringify(this.getImageData().files);
    this.toggleImagesPanelButton.addEventListener("click", () =>
      this.setState({
        imagesPanelVisible: !this.getState().imagesPanelVisible,
      })
    );
  }

  redraw() {
    // Toggle visibility
    const imagesPanelVisible = this.getState().imagesPanelVisible;
    if (imagesPanelVisible && this.imagesPanel.classList.contains("hidden")) {
      this.imagesPanel.classList.remove("hidden");
      this.toggleImagesPanelButton.textContent = "Hide Images";
    } else if (
      !imagesPanelVisible &&
      !this.imagesPanel.classList.contains("hidden")
    ) {
      this.imagesPanel.classList.add("hidden");
      this.toggleImagesPanelButton.textContent = "Show Images";
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
        listItem.appendChild(imageElem);

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
