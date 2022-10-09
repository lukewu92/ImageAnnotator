import {
  AnnotationsPanel,
  Canvas,
  ImageInfo,
  ImagesPanel,
  UploadButton,
} from "./components/index.js";
import {
  ANNOTATION_DATA_KEY,
  APP_STATE_KEY,
  IMAGE_DATA_KEY,
} from "./constants/localStorageKeys.js";
import {
  ClearAllAnnotationButton,
  DataLoader,
  DeleteImageButton,
  ExportButton,
  LoadButton,
  NextButton,
  PreviousButton,
  UploadImageButton,
  ZoomAmount,
  ZoomIn,
  ZoomOut,
} from "./selectors.js";
import { base64ToBlob } from "./util/base64ToBlob.js";

const defaultImageData = {
  files: [],
};
const defaultState = {
  imagesPanelVisible: true,
  annotationsPanelVisible: true,
  imageOffset: null,
  mouseDown: null,
  mouseDownPosition: null,
  mouseMiddleDown: null,
  mouseMiddleDownPosition: null,
  temporaryImageOffset: null,
  mousePosition: null,
  selectedFileIndex: 0,
  temporaryLineOffset: null,
  mouseDownAnnotation: null,
  draggingAnnotationOffset: null,
};

const defaultAnnotationData = {};

class MainApp {
  constructor() {
    // Load annotation data
    const annotationData = window.localStorage.getItem(ANNOTATION_DATA_KEY);
    if (annotationData === null) {
      window.localStorage.setItem(
        ANNOTATION_DATA_KEY,
        JSON.stringify(defaultAnnotationData)
      );
      this.annotationData = defaultAnnotationData;
    } else {
      this.annotationData = JSON.parse(annotationData);
    }

    // Load image data from localStorage or create defaults, might be deprecated due to constraints on localStorage size limit
    this.imageData = defaultImageData;
    const imageData = window.localStorage.getItem(IMAGE_DATA_KEY);
    if (imageData === null) {
      window.localStorage.setItem(
        IMAGE_DATA_KEY,
        JSON.stringify(defaultImageData)
      );
      this.imageData = defaultImageData;
    } else {
      this.imageData = JSON.parse(imageData);
    }

    // Check stored states
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
    this.clearAnnotations = ClearAllAnnotationButton;
    this.uploadButton = UploadImageButton;
    this.previousButton = PreviousButton;
    this.nextButton = NextButton;
    this.loadButton = LoadButton;
    this.exportButton = ExportButton;
    this.dataLoader = DataLoader;
    this.zoomAmount = ZoomAmount;
    this.zoomIn = ZoomIn;
    this.zoomOut = ZoomOut;

    // Bind getters and setters to component
    this.canvas = new Canvas(this.getGettersAndSetters);
    this.imagesPanel = new ImagesPanel(this.getGettersAndSetters);
    this.annotationsPanel = new AnnotationsPanel(this.getGettersAndSetters);
    this.uploadButton = new UploadButton(this.getGettersAndSetters);
    this.imageInfo = new ImageInfo(this.getGettersAndSetters);
  }

  init = () => {
    // Initialize components
    this.imagesPanel.init();
    this.annotationsPanel.init();
    this.uploadButton.init();
    this.canvas.init();
    this.imageInfo.init();

    //Load storage data
    if (this.imageData?.files) {
      console.log("files");
      // Generate blobs
      const files = this.imageData?.files;
      const processedImageData = [];
      files.forEach((file) => {
        const base64Data = file.base64Data;
        try {
          const blob = base64ToBlob(base64Data, "image/jpeg");
          const src = URL.createObjectURL(blob);
          processedImageData.push({
            ...file,
            src,
            base64Data,
          });
        } catch (e) {
          alert(
            `${file.name} data is corrupted. This can be due to storage limitation causing partial bytes to be stored.`
          );
          console.error(
            `${file.name} data is corrupted. This can be due to storage limitation causing partial bytes to be stored`
          );
        }
      });
      this.setImageData({
        files: processedImageData,
      });
    }

    // Export functionality
    this.exportButton.addEventListener("click", () => {
      const imageData = this.imageData;
      const annotationData = this.annotationData;
      const exportData = { imageData, annotationData };

      let dataStr = JSON.stringify(exportData);
      let dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      let exportFileDefaultName = "image-annotator.json";

      let linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    });

    // Load functionality
    this.loadButton.addEventListener("click", () => {
      this.dataLoader.click();
    });

    this.dataLoader.addEventListener("change", () => {
      const files = this.dataLoader.files;
      var reader = new FileReader();
      reader.onload = (e) => {
        const dataObject = JSON.parse(e.target.result);
        // Generate blobs
        const files = dataObject?.imageData?.files;
        const processedImageData = [];
        files.forEach((file) => {
          const base64Data = file.base64Data;
          const blob = base64ToBlob(base64Data, "image/jpeg");
          const src = URL.createObjectURL(blob);
          processedImageData.push({
            ...file,
            src,
            base64Data,
          });
        });
        this.setImageData({
          files: processedImageData,
        });
        // this.setAnnotationData(dataObject?.annotationData);
      };
      reader.readAsText(files[0]);
    });

    // Delete functionality
    this.deleteButton.onclick = (e) => {
      const selectedFileIndex = this.state?.selectedFileIndex;
      const files = [...this.imageData?.files];
      files.splice(selectedFileIndex, 1);
      this.setImageData({ files });
      this.setState({ selectedFileIndex: 0 });
    };

    // Clear annotations functionality
    this.clearAnnotations.onclick = (e) => {
      const selectedFileIndex = this.state?.selectedFileIndex;
      const imageName = this.imageData?.files[selectedFileIndex]?.name;
      this.setAnnotationData({
        [imageName]: [],
      });
    };

    // Zoom functionality
    this.zoomIn.onclick = (e) => {
      this.setState({
        zoom: this.state?.zoom * 2,
      });
    };
    this.zoomOut.onclick = (e) => {
      this.setState({
        zoom: this.state?.zoom / 2,
      });
    };

    this.redraw();
  };

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
      try {
        window.localStorage.setItem(
          IMAGE_DATA_KEY,
          JSON.stringify(this.imageData)
        );
      } catch (e) {
        if (String(e).includes("exceeded the quota")) {
          alert(
            "Image size has exceeded browser storage limit! Please use the export button to save your data to prevent losing your changes!"
          );
        }
        console.error(e);
      }
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
        ANNOTATION_DATA_KEY,
        JSON.stringify(this.annotationData)
      );
      this.redraw();
    }
  }

  redraw() {
    // Update side panel visibility
    this.imagesPanel.redraw();
    this.annotationsPanel.redraw();
    this.imageInfo.redraw();
  }
}

const mainApp = new MainApp();

mainApp.init();
