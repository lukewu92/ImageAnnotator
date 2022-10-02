export const createTextField = () => document.createElement("input");

export const createImageListItem = () => {
  const element = document.createElement("div");
  element.classList.add("image-list-item");
  return element;
};

export const createImage = (src) => {
  const imgElem = document.createElement("img");
  imgElem.src = src;
  return imgElem;
};

{
  /* <div class="mouse-position" data-component="mousePosition">
  <span class="mouse-dot"></span>
  <span class="mouse-line top" data-component="mouseLineTop"></span>
  <span class="mouse-line bottom" data-component="mouseLineBottom"></span>
  <span class="mouse-line left" data-component="mouseLineLeft"></span>
  <span class="mouse-line right" data-component="mouseLineRight"></span>
  <span class="mouse-coordinates" data-component="mouseCoordinates">
    x: 74, y: 74
  </span>
</div> */
}
export const MousePosition = document.querySelector(
  '[data-component="mousePosition"]'
);
export const MouseLineTop = document.querySelector(
  '[data-component="mouseLineTop"]'
);

export const MouseLineBottom = document.querySelector(
  '[data-component="mouseLineBottom"]'
);

export const MouseLineLeft = document.querySelector(
  '[data-component="mouseLineLeft"]'
);

export const MouseLineRight = document.querySelector(
  '[data-component="mouseLineRight"]'
);

export const MouseCoordinates = document.querySelector(
  '[data-component="mouseCoordinates"]'
);

export const ImagesPanelElement = document.querySelector(
  '[data-component="imagesPanel"]'
);
export const ToggleImagesPanelButton = document.querySelector(
  '[data-component="toggleImagesPanelButton"]'
);
export const ImageListContainer = document.querySelector(
  '[data-component="imageListContainer"]'
);
export const ImageSection = document.querySelector(
  '[data-component="imageSection"]'
);

export const AnnotationsPanelElement = document.querySelector(
  '[data-component="annotationsPanel"]'
);
export const ToggleAnnotationsPanelButton = document.querySelector(
  '[data-component="toggleAnnotationsPanelButton"]'
);
export const AnnotationsListContainer = document.querySelector(
  '[data-component="annotationListContainer"]'
);

export const ImageCache = document.querySelector(
  '[data-component="imageCache"]'
);
export const CanvasContainer = document.querySelector(
  '[data-component="canvasContainer"]'
);
export const CanvasElement = document.querySelector(
  '[data-component="canvas"]'
);
export const PreviousButton = document.querySelector(
  '[data-component="previousButton"]'
);
export const NextButton = document.querySelector(
  '[data-component="nextButton"]'
);

export const SelectedFileName = document.querySelector(
  '[data-component="selected-file-name"]'
);

export const DeleteImageButton = document.querySelector(
  '[data-component="deleteImageButton"]'
);
export const UploadImageButton = document.querySelector(
  '[data-component="uploadImageButton"]'
);
export const FileInput = document.querySelector('[data-component="fileInput"]');
