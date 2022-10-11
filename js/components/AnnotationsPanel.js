import {
  AnnotationsListContainer,
  AnnotationsPanelElement,
  createTextField,
  ToggleAnnotationsPanelButton,
  ToggleAnnotationsPanelButtonText,
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
    this.toggleAnnotationPanelButtonText = ToggleAnnotationsPanelButtonText;
    this.annotationList = AnnotationsListContainer;
    this.prevAnnotationDataJSON = null;
    this.prevSelectedIndex = null;
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
    if (annotations.length === 1) {
      return this.setAnnotationData({
        [imageName]: [],
      });
    }
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

    // Stop setting annotation data if it's already deleted
    if (annotations[index]?.x !== undefined) {
      this.setAnnotationData({ [imageName]: annotations });
    }
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

      const deleteButtonElem = document.createElement("button");
      deleteButtonElem.innerHTML = `<svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
    <path
        d="M10 6H14C14 5.46957 13.7893 4.96086 13.4142 4.58579C13.0391 4.21071 12.5304 4 12 4C11.4696 4 10.9609 4.21071 10.5858 4.58579C10.2107 4.96086 10 5.46957 10 6V6ZM8 6C8 4.93913 8.42143 3.92172 9.17157 3.17157C9.92172 2.42143 10.9391 2 12 2C13.0609 2 14.0783 2.42143 14.8284 3.17157C15.5786 3.92172 16 4.93913 16 6H21C21.2652 6 21.5196 6.10536 21.7071 6.29289C21.8946 6.48043 22 6.73478 22 7C22 7.26522 21.8946 7.51957 21.7071 7.70711C21.5196 7.89464 21.2652 8 21 8H20.118L19.232 18.34C19.1468 19.3385 18.69 20.2686 17.9519 20.9463C17.2137 21.6241 16.2481 22.0001 15.246 22H8.754C7.75191 22.0001 6.78628 21.6241 6.04815 20.9463C5.31002 20.2686 4.85318 19.3385 4.768 18.34L3.882 8H3C2.73478 8 2.48043 7.89464 2.29289 7.70711C2.10536 7.51957 2 7.26522 2 7C2 6.73478 2.10536 6.48043 2.29289 6.29289C2.48043 6.10536 2.73478 6 3 6H8ZM15 12C15 11.7348 14.8946 11.4804 14.7071 11.2929C14.5196 11.1054 14.2652 11 14 11C13.7348 11 13.4804 11.1054 13.2929 11.2929C13.1054 11.4804 13 11.7348 13 12V16C13 16.2652 13.1054 16.5196 13.2929 16.7071C13.4804 16.8946 13.7348 17 14 17C14.2652 17 14.5196 16.8946 14.7071 16.7071C14.8946 16.5196 15 16.2652 15 16V12ZM10 11C9.73478 11 9.48043 11.1054 9.29289 11.2929C9.10536 11.4804 9 11.7348 9 12V16C9 16.2652 9.10536 16.5196 9.29289 16.7071C9.48043 16.8946 9.73478 17 10 17C10.2652 17 10.5196 16.8946 10.7071 16.7071C10.8946 16.5196 11 16.2652 11 16V12C11 11.7348 10.8946 11.4804 10.7071 11.2929C10.5196 11.1054 10.2652 11 10 11Z"
        fill="currentColor"
      />
    </svg>
    `;
      deleteButtonElem.classList.add("delete-annotation");

      const inputElem = createTextField();
      inputElem.placeholder = "Insert Label";
      inputElem.classList.add("label-input");
      inputElem.dataset.annotationFieldIndex = index;
      inputElem.textContent = label;

      elem.appendChild(inputElem);
      elem.appendChild(deleteButtonElem);

      this.annotationList.appendChild(elem);

      const onBlurEvent = (e) => {
        this.updateAnnotationLabel(index, e.target.textContent);
      };

      const onKeyDownEvent = (e) => {
        if (e.key === "Delete" && e.target.textContent === "") {
          e.preventDefault();
          return this.deleteAnnotationAtIndex(index);
        }
        // Close annotation for mobile device to avoid disruption
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur();
          const deviceWidth = document.documentElement.clientWidth;
          if (deviceWidth <= 639) {
            this.setState({ annotationsPanelVisible: false });
          }
        }
      };

      const onFocusEvent = () =>
        this.setAnnotationData({
          selectedAnnotationIndex: index,
        });

      const onElemClickEvent = () => inputElem.focus();

      inputElem.addEventListener("blur", onBlurEvent);
      inputElem.addEventListener("keydown", onKeyDownEvent);
      inputElem.addEventListener("focus", onFocusEvent);
      elem.addEventListener("click", onElemClickEvent);

      const onDeleteClickEvent = () => {
        inputElem.removeEventListener("blur", onBlurEvent);
        inputElem.removeEventListener("keydown", onKeyDownEvent);
        inputElem.removeEventListener("focus", onFocusEvent);
        elem.removeEventListener("click", onElemClickEvent);
        this.deleteAnnotationAtIndex(index);
      };

      deleteButtonElem.addEventListener("click", onDeleteClickEvent);
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
    const imageAnnotationInfo = this.getImageAnnotationInfo();
    const selectedAnnotationIndex =
      this?.getAnnotationData()?.selectedAnnotationIndex;

    if (this.prevSelectedIndex !== selectedAnnotationIndex) {
      this.prevSelectedIndex = selectedAnnotationIndex;
      this.higlightSelectedItem();
    }

    if (
      annotationsPanelVisible &&
      this.annotationsPanel.classList.contains("hidden")
    ) {
      this.annotationsPanel.classList.remove("hidden");
      this.toggleAnnotationPanelButtonText.textContent = "Hide Annotations";
    } else if (
      !annotationsPanelVisible &&
      !this.annotationsPanel.classList.contains("hidden")
    ) {
      this.annotationsPanel.classList.add("hidden");
      this.toggleAnnotationPanelButtonText.textContent = "Show Annotations";
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
