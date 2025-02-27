import React, { useState, useRef, useEffect } from "react";
import "./UploadFile.css";
import UploadFolder from "../assets/Uploadfolder.svg";

const UploadFile = ({ onClose, wsRef, onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = [...e.dataTransfer.files];
    if (droppedFiles?.length > 0) {
      handleFileValidation(droppedFiles);
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = [...e.target.files];
    if (selectedFiles?.length > 0) {
      handleFileValidation(selectedFiles);
    }
  };

  const handleFileValidation = (fileList) => {
    const validFiles = fileList.filter((file) => {
      const validTypes = [
        "text/plain",
        "application/zip",
        "application/x-yaml",
        "application/yml",
        "text/csv",
      ];
      const maxSize = 100 * 1024 * 1024;
      return validTypes.includes(file.type) && file.size <= maxSize;
    });
    // setFiles((prev) => [...prev, ...validFiles]); multiple
    setFiles(validFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getBase64 = (file) => {
    return new Promise((resolve) => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      // reader.onload = () => {
      //   // Make a fileInfo Object
      //   baseURL = reader.result;
      //   resolve(baseURL);
      // };
      reader.onload = () => {
        // Extract base64 content (after the comma)
        const base64String = reader.result.split(',')[1]; // Get content after 'data:[mime-type];base64,'
        resolve(base64String);  // Resolve with just the base64 content
      };
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      let fileContent = [];
    
      for (const file of files) {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));

        const base64 = await getBase64(file);

        let obj = {
          file_extension: file?.type,
          content: base64,
          name: file?.name
        };
        fileContent.push(obj);

        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } 
      // this is for multiple file


      onFileSelect(fileContent);

      onClose();
    } catch (e) {
      console.log(e);
    }
  };




  useEffect(() => {
    // cleanup - modal close - file list state - empty
    return () => {
      setFiles([]);
      setUploadProgress({});
    };
  }, []);

  return (
    <div className="file-upload-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Please Upload your Swagger Document</h2>
          <p className="modal-subtitle">
            Upload your swagger YAML file (optional) and/or enter a custom
            prompt
          </p>
        </div>

        <div className="upload-section">
          <div
            className={`drop-zone ${dragActive ? "active" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <img src={UploadFolder} alt="Upload folder" />
            </div>
            <p className="drop-text">Select a file or drag and drop here</p>
            <p className="file-types">
              Upload swagger doc (.zip, no more than 100 MB)
            </p>
            <button
              className="select-button"
              onClick={() => inputRef.current?.click()}
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden-input"
              onChange={handleFileInput}
              accept=".yaml,.yml, .csv"
            />
          </div>
        </div>

        <div className="file-list">
          {files.length > 0 && (
            <>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <svg
                      className="file-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <div className="progress-container">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      {uploadProgress[file.name] || 0}%
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="proceed-button"
            onClick={handleUpload}
            disabled={files.length === 0}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;