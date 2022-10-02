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
    } else if (
      !imagesPanelVisible &&
      !this.imagesPanel.classList.contains("hidden")
    ) {
      this.imagesPanel.classList.add("hidden");
    }

    // Handle file list updates
    const files = this.getImageData().files;
    if (this.previousFilesJSON !== JSON.stringify(files)) {
      this.previousFilesJSON = JSON.stringify(files);

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
      this.previousSelectedFileIndex !== this.getState()?.selectedFileIndex &&
      files.length > 0
    ) {
      this.previousSelectedFileIndex = this.getState()?.selectedFileIndex;
      const allImages = document.querySelectorAll(".image-list-item");
      allImages.forEach((image) => {
        image.classList.remove("active");
      });

      const activeImage = document.querySelector(
        `[data-image-file-index="${String(
          this.getState()?.selectedFileIndex
        )}"]`
      );
      activeImage?.classList?.add("active");
    }
  }
}
