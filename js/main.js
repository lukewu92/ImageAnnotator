import { AnnotationsPanel, Canvas, ImageInfo, ImagesPanel, UploadButton } from './components/index.js';
import { ANNOTATION_DATA_KEY, APP_STATE_KEY, IMAGE_DATA_KEY } from './constants/localStorageKeys.js';
import { DeleteImageButton, NextButton, PreviousButton, UploadImageButton } from './selectors.js';

const defaultImageData = {
  files: [],
};
const defaultState = {
  imagesPanelVisible: true,
  annotationsPanelVisible: true,
};

class MainApp {
  constructor() {
    // Load annotation data
    const annotationData = window.localStorage.getItem(ANNOTATION_DATA_KEY);

    // Load image data from localStorage or create defaults, might be deprecated due to constraints on localStorage size limit
    this.imageData = defaultImageData;
    // const imageData = window.localStorage.getItem(IMAGE_DATA_KEY);
    // if (imageData === null) {
    //   window.localStorage.setItem(
    //     IMAGE_DATA_KEY,
    //     JSON.stringify(defaultImageData)
    //   );
    //   this.imageData = defaultImageData;
    // } else {
    //   this.imageData = JSON.parse(imageData);
    // }

    // Check stored config/states
    const appState = window.localStorage.getItem(APP_STATE_KEY);
    if (appState === null) {
      window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(defaultState));
      this.state = defaultState;
    } else {
      this.state = JSON.parse(appState);
    }

    // Bind global
    this.redraw = this.redraw.bind(this);
    this.setState = this.setState.bind(this);
    this.setImageData = this.setImageData.bind(this);
    this.setAnnotationData = this.setAnnotationData.bind(this);
    this.getGettersAndSetters = this.getGettersAndSetters.bind(this);

    this.deleteButton = DeleteImageButton;
    this.uploadButton = UploadImageButton;
    this.previousButton = PreviousButton;
    this.nextButton = NextButton;

    // Bind getters and setters to component
    this.canvas = new Canvas(this.getGettersAndSetters);
    this.imagesPanel = new ImagesPanel(this.getGettersAndSetters);
    this.annotationsPanel = new AnnotationsPanel(this.getGettersAndSetters);
    this.uploadButton = new UploadButton(this.getGettersAndSetters);
    this.imageInfo = new ImageInfo(this.getGettersAndSetters);
  }

  redraw() {
    // Update side panel visibility
    this.imagesPanel.redraw();
    this.annotationsPanel.redraw();
    this.imageInfo.redraw();
    this.canvas.redraw();
  }

  getGettersAndSetters() {
    return {
      getImageData: () => this.imageData,
      setImageData: this.setImageData,
      getAnnotationData: () => this.annotationData,
      setAnnotationData: this.setAnnotationData,
      getState: () => this.state,
      setState: this.setState,
    };
  }

  setState(newState) {
    const prevState = { ...this.state };
    const nextState = { ...this.state, ...newState };

    if (JSON.stringify(prevState) !== JSON.stringify(nextState)) {
      this.state = {
        ...this.state,
        ...newState,
      };
      window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(this.state));
      this.redraw();
    }
  }

  setImageData(newData) {
    const prevImageData = { ...this.imageData };
    const nextImageData = { ...this.imageData, ...newData };

    if (JSON.stringify(prevImageData) !== JSON.stringify(nextImageData)) {
      this.imageData = {
        ...this.imageData,
        ...newData,
      };
      window.localStorage.setItem(
        IMAGE_DATA_KEY,
        JSON.stringify(this.imageData)
      );
      console.log("image data", this.imageData);
      this.redraw();
    }
  }

  setAnnotationData(newData) {
    const prevAnnotationData = { ...this.annotationData };
    const nextAnnotationData = { ...this.annotationData, ...newData };

    if (
      JSON.stringify(prevAnnotationData) !== JSON.stringify(nextAnnotationData)
    ) {
      this.annotationData = {
        ...this.annotationData,
        ...newData,
      };
      window.localStorage.setItem(
        IMAGE_DATA_KEY,
        JSON.stringify(this.annotationData)
      );
      console.log("annotationData", this.annotationData);
      this.redraw();
    }
  }

  init() {
    // Initialize components
    this.imagesPanel.init();
    this.annotationsPanel.init();
    this.uploadButton.init();
    this.canvas.init();
    this.imageInfo.init();

    this.redraw();
  }

  getUploadedFiles() {}
}

const mainApp = new MainApp();

mainApp.init();
