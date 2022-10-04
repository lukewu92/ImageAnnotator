import { FileInput, UploadImageButton } from '../selectors.js';
import { getBase64Image } from '../util/image.js';

export class UploadButton {
  constructor(getGettersAndSetters) {
    const { getImageData, setImageData, setState, getState } =
      getGettersAndSetters();

    this.getImageData = getImageData;
    this.setImageData = setImageData;
    this.setState = setState;
    this.getState = getState;
    this.uploadImageButton = UploadImageButton;
    this.fileInput = FileInput;
  }

  init() {
    this.uploadImageButton.addEventListener("click", () => {
      // console.log("click");
      this.fileInput.click();
    });
    this.fileInput.addEventListener(
      "change",
      () => {
        const files = this.fileInput.files;
        const fileInfos = [];
        for (let i = 0; i < files.length; i++) {
          const img = new Image();
          img.onload = () => {
            /* Uncomment to store image data to localStorage, limited to 5MB per browser */
            const base64Data = getBase64Image(img);
            // add width and height to properties after loaded
            const newFileList = [...this.getImageData().files];

            const newProperties = {
              ...newFileList[i],
              width: img.width,
              height: img.height,
              base64Data: base64Data,
            };
            newFileList[i] = newProperties;
            this.setImageData({
              files: newFileList,
            });
          };
          img.src = URL.createObjectURL(files[i]);

          // Save image properties to local data
          const file = files[i];
          const fileName = file.name;
          fileInfos.push({
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
            size: file.size,
            src: img.src,
          });
        }

        this.setImageData({
          files: fileInfos,
        });
        this.setState({
          ...this.getState(),
          selectedFileIndex: 0,
        });
      },
      false
    );
  }
}
