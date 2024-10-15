import React, { FC, useEffect, useState } from 'react';

import {
  MultipleFileUpload,
  MultipleFileUploadStatus,
  MultipleFileUploadStatusItem,
  HelperText,
  HelperTextItem,
  DropEvent,
  MultipleFileUploadMain
} from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';

interface readFile {
  fileName: string;
  data?: string;
  loadResult?: 'danger' | 'success';
  loadError?: DOMException;
}

export const MultipleFileUploadBasic: FC<{
  onFileContentChange: (files: string[]) => void;
  onFileNamesChange: (fileNames: File[]) => void;
}> = function ({ onFileContentChange, onFileNamesChange }) {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [readFileData, setReadFileData] = useState<readFile[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [statusIcon, setStatusIcon] = useState('inProgress');

  // only show the status component once a file has been uploaded, but keep the status list component itself even if all files are removed
  if (!showStatus && currentFiles.length > 0) {
    setShowStatus(true);
  }

  // determine the icon that should be shown for the overall status list
  useEffect(() => {
    if (readFileData.length < currentFiles.length) {
      setStatusIcon('inProgress');
    } else if (readFileData.every((file) => file.loadResult === 'success')) {
      setStatusIcon('success');
      const data = readFileData.map((file) => file.data) as string[];
      onFileContentChange(data);
    } else {
      setStatusIcon('danger');
    }
  }, [readFileData, currentFiles, onFileContentChange]);

  // remove files from both state arrays based on their name
  const removeFiles = (namesOfFilesToRemove: string[]) => {
    const newCurrentFiles = currentFiles.filter(
      (currentFile) => !namesOfFilesToRemove.some((fileName) => fileName === currentFile.name)
    );

    setCurrentFiles(newCurrentFiles);

    const newReadFiles = readFileData.filter(
      (readFile) => !namesOfFilesToRemove.some((fileName) => fileName === readFile.fileName)
    );

    setReadFileData(newReadFiles);
  };

  /** Forces uploaded files to become corrupted if "Demonstrate error reporting by forcing uploads to fail" is selected in the example,
   * only used in this example for demonstration purposes */
  const updateCurrentFiles = (neWFiles: File[]) => {
    setCurrentFiles((prevFiles) => [...prevFiles, ...neWFiles]);
    onFileNamesChange([...currentFiles, ...neWFiles]);
  };

  // callback that will be called by the react dropzone with the newly dropped file objects
  const handleFileDrop = (_event: DropEvent, droppedFiles: File[]) => {
    // identify what, if any, files are re-uploads of already uploaded files
    const currentFileNames = currentFiles.map((file) => file.name);
    const reUploads = droppedFiles.filter((droppedFile) => currentFileNames.includes(droppedFile.name));

    /** this promise chain is needed because if the file removal is done at the same time as the file adding react
     * won't realize that the status items for the re-uploaded files needs to be re-rendered */
    Promise.resolve()
      .then(() => removeFiles(reUploads.map((file) => file.name)))
      .then(() => updateCurrentFiles(droppedFiles));
  };

  // callback called by the status item when a file is successfully read with the built-in file reader
  const handleReadSuccess = (data: string, file: File) => {
    function decodeBase64Data(base64String: string) {
      // Remove the data URL part and keep only the base64 encoded content
      const base64Data = base64String.split(',')[1];

      // Decode the base64 string
      const decodedData = atob(base64Data);

      // Return the decoded string
      return decodedData;
    }

    setReadFileData((prevReadFiles) => [
      ...prevReadFiles,
      { data: decodeBase64Data(data), fileName: file.name, loadResult: 'success' }
    ]);
  };

  // callback called by the status item when a file encounters an error while being read with the built-in file reader
  const handleReadFail = (error: DOMException, file: File) => {
    setReadFileData((prevReadFiles) => [
      ...prevReadFiles,
      { loadError: error, fileName: file.name, loadResult: 'danger' }
    ]);
  };

  // add helper text to a status item showing any error encountered during the file reading process
  const createHelperText = (file: File) => {
    const fileResult = readFileData.find((readFile) => readFile.fileName === file.name);
    if (!fileResult?.loadError) {
      return null;
    }

    return (
      <HelperText isLiveRegion>
        <HelperTextItem variant={'error'}>{fileResult.loadError.toString()}</HelperTextItem>
      </HelperText>
    );

  };

  const successfullyReadFileCount = readFileData.filter((fileData) => fileData.loadResult === 'success').length;

  return (
    <MultipleFileUpload onFileDrop={handleFileDrop} isHorizontal={false}>
      {true && (
        <MultipleFileUploadStatus
          statusToggleText={`${successfullyReadFileCount} of ${currentFiles.length} files uploaded`}
          statusToggleIcon={statusIcon}
          aria-label="Current uploads"
        >
          <MultipleFileUploadMain titleIcon={<UploadIcon />} titleText="Drag and drop files here" />
          {currentFiles.map((file) => (
            <MultipleFileUploadStatusItem
              file={file}
              key={file.name}
              onClearClick={() => removeFiles([file.name])}
              onReadSuccess={handleReadSuccess}
              onReadFail={handleReadFail}
              progressHelperText={createHelperText(file)}
            />
          ))}
        </MultipleFileUploadStatus>
      )}
    </MultipleFileUpload>
  );
};
