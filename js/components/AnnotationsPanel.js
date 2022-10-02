import { AnnotationsListContainer, AnnotationsPanelElement, ToggleAnnotationsPanelButton } from '../selectors.js';

export class AnnotationsPanel {
  constructor(getGettersAndSetters) {
    const { getState, setState } = getGettersAndSetters();

    this.getState = getState;
    this.setState = setState;
    this.annotationsPanel = AnnotationsPanelElement;
    this.toggleAnnotationsPanelButton = ToggleAnnotationsPanelButton;
    this.annotationList = AnnotationsListContainer;
  }

  init() {
    this.toggleAnnotationsPanelButton.addEventListener("click", () =>
      this.setState({
        annotationsPanelVisible: !this.getState().annotationsPanelVisible,
      })
    );
  }

  redraw() {
    const annotationsPanelVisible = this.getState().annotationsPanelVisible;

    if (
      annotationsPanelVisible &&
      this.annotationsPanel.classList.contains("hidden")
    ) {
      this.annotationsPanel.classList.remove("hidden");
    } else if (
      !annotationsPanelVisible &&
      !this.annotationsPanel.classList.contains("hidden")
    ) {
      this.annotationsPanel.classList.add("hidden");
    }
  }
}
