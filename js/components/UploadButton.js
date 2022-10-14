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
      this.fileInput.click();
    });
    this.fileInput.addEventListener(
      "change",
      () => {
        const oldFiles = [...(this.getImageData()?.files || [])];
        const files = this.fileInput.files;
        const fileInfos = oldFiles;
        const offsetIndex = oldFiles.length;
        let filesAdded = 0;

        for (let i = 0; i < files.length; i++) {
          const alreadyExist = Boolean(
            oldFiles.find((f) => f.name === files[i].name)
          );
          if (alreadyExist) continue;
          filesAdded++;

          const img = new Image();
          img.onload = () => {
            /* Uncomment to store image data to localStorage, limited to 5MB per browser */
            const base64Data = getBase64Image(img);
            // add width and height to properties after loaded
            const newFileList = [...this.getImageData().files];
            let fileIndex = newFileList.findIndex((f) => f.name === img.name);

            fileIndex = fileIndex < 0 ? i + offsetIndex : fileIndex;

            const newProperties = {
              ...newFileList[fileIndex],
              width: img.width,
              height: img.height,
              base64Data: base64Data,
            };

            newFileList[fileIndex] = newProperties;
            console.log("newFileList", newFileList);

            this.setImageData({
              files: newFileList,
            });
          };
          img.src = URL.createObjectURL(files[i]);
          // Save image properties to local data
          const file = files[i];
          // Check if file already exist in list
          fileInfos.push({
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate,
            size: file.size,
            src: img.src,
          });
        }

        if (filesAdded > 0) {
          this.setImageData({
            files: fileInfos,
          });

          this.setState({
            ...this.getState(),
            selectedFileIndex: offsetIndex + files.length - 1,
          });
        } else {
          alert("File already exist!");
        }
      },
      false
    );
  }
}
