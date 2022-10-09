import {
  AnnotationsListContainer,
  AnnotationsPanelElement,
  AppElement,
  ToggleAnnotationsPanelButton,
} from "../selectors.js";
import { removeAllChildNodes } from "../util/element.js";

export class AnnotationsPanel {
  constructor(getGettersAndSetters) {
    const {
      getState,
      setState,
      getAnnotationData,
      setAnnotationData,
      getImageData,
    } = getGettersAndSetters();

    this.getState = getState;
    this.setState = setState;
    this.getAnnotationData = getAnnotationData;
    this.setAnnotationData = setAnnotationData;
    this.getImageData = getImageData;
    this.annotationsPanel = AnnotationsPanelElement;
    this.toggleAnnotationsPanelButton = ToggleAnnotationsPanelButton;
    this.annotationList = AnnotationsListContainer;
    this.prevAnnotationDataJSON = null;
    this.prevSelectedIndex = null;
    this.appElement = AppElement;
  }

  init() {
    this.toggleAnnotationsPanelButton.addEventListener("click", () =>
      this.setState({
        annotationsPanelVisible: !this.getState().annotationsPanelVisible,
      })
    );
  }

  getImageAnnotationInfo = () => {
    const imageName = this.getImageInfo()?.name;
    return this.getAnnotationData()?.[imageName];
  };

  getImageInfo = () => {
    const files = this.getImageData()?.files;
    const selectedFileIndex = this.getState()?.selectedFileIndex;
    return files[selectedFileIndex];
  };

  clearAllAnnotations = () => {};

  deleteAnnotationAtIndex = (index) => {
    const imageName = this.getImageInfo()?.name;
    const annotations = [...this.getImageAnnotationInfo()];
    annotations.splice(index, 1);
    this.setAnnotationData({
      [imageName]: annotations,
    });
  };

  updateAnnotationLabel = (index, label) => {
    const imageName = this.getImageInfo()?.name;
    const annotations = [...this.getImageAnnotationInfo()];
    annotations[index] = {
      ...annotations[index],
      label: label,
    };
    this.setAnnotationData({ [imageName]: annotations });
  };
  drawListOfAnnotations = () => {
    const annotations = this.getImageAnnotationInfo();
    const selectedAnnotationIndex =
      this.getAnnotationData()?.selectedAnnotationIndex;

    removeAllChildNodes(this.annotationList);
    annotations.forEach(({ label, x, y, width, height }, index) => {
      const elem = document.createElement("div");
      elem.classList.add("annotation-list-item");
      elem.dataset.annotationItem = true;
      elem.dataset.annotationIndex = index;

      const inputElem = document.createElement("input");
      inputElem.placeholder = "Insert Label";
      inputElem.classList.add("label-input");
      inputElem.dataset.annotationFieldIndex = index;
      inputElem.value = label;
      inputElem.onchange = (e) => {
        this.updateAnnotationLabel(index, e.target.value);
      };
      inputElem.onkeydown = (e) => {
        if (e.key === "Delete" && e.target.value === "") {
          this.deleteAnnotationAtIndex(index);
        }
        // Close annotation for mobile device to avoid disruption
        if (e.key === "Enter") {
          const deviceWidth = document.documentElement.clientWidth;
          if (deviceWidth <= 639) {
            this.setState({ annotationsPanelVisible: false });
          }
        }
      };
      inputElem.onfocus = () =>
        this.setAnnotationData({
          selectedAnnotationIndex: index,
        });
      inputElem.onblur = () =>
        this.setAnnotationData({
          selectedAnnotationIndex: null,
        });

      const deleteButtonElem = document.createElement("button");
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "/images/delete.svg";
      deleteIcon.alt = "Delete";
      deleteButtonElem.appendChild(deleteIcon);
      deleteButtonElem.onclick = () => this.deleteAnnotationAtIndex(index);

      elem.appendChild(inputElem);
      elem.appendChild(deleteButtonElem);

      this.annotationList.appendChild(elem);

      elem.onclick = () => inputElem.focus();
    });
  };

  higlightSelectedItem = () => {
    const allElems = document.querySelectorAll("[data-annotation-item=true]");
    allElems.forEach((elem) => {
      const elemIndex = elem.dataset.annotationIndex;
      const selectedIndex = this.getAnnotationData()?.selectedAnnotationIndex;
      if (elemIndex == selectedIndex) {
        if (!elem.classList.contains("highlight")) {
          elem.classList.add("highlight");
        }
      } else {
        if (elem.classList.contains("highlight")) {
          elem.classList.remove("highlight");
        }
      }
    });
  };

  redraw = () => {
    const annotationsPanelVisible = this.getState().annotationsPanelVisible;
    const hideOtherPanel =
      document.documentElement.clientWidth <= 639 && annotationsPanelVisible;
    const imageAnnotationInfo = this.getImageAnnotationInfo();
    const selectedAnnotationIndex =
      this?.getAnnotationData()?.selectedAnnotationIndex;

    if (this.prevSelectedIndex !== selectedAnnotationIndex) {
      this.prevSelectedIndex = selectedAnnotationIndex;
      this.higlightSelectedItem();
    }

    this.appElement.classList.toggle("overlay-visible", hideOtherPanel);

    if (
      annotationsPanelVisible &&
      this.annotationsPanel.classList.contains("hidden")
    ) {
      this.annotationsPanel.classList.remove("hidden");
      this.toggleAnnotationsPanelButton.textContent = "Hide Annotations";
    } else if (
      !annotationsPanelVisible &&
      !this.annotationsPanel.classList.contains("hidden")
    ) {
      this.annotationsPanel.classList.add("hidden");
      this.toggleAnnotationsPanelButton.textContent = "Show Annotations";
    }

    // Check of have image annotations
    if (
      imageAnnotationInfo &&
      this.prevAnnotationDataJSON !== JSON.stringify(imageAnnotationInfo)
    ) {
      this.prevAnnotationDataJSON = JSON.stringify(imageAnnotationInfo);
      this.drawListOfAnnotations();
    }
  };
}
