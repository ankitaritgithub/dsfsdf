import React, { useState, useEffect } from "react";
import "./chatbotresponse.css";
import copyIcon from "../assets/copy.svg";
import downloadIcon from "../assets/Download.svg";
import arrowIcon from "../assets/arrowicons.svg";
import responsePoint from "../assets/responsepoint.svg";

const ChatbotResponse = ({ content, suggestions }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);


  console.log(displayedContent, "nice boom")

  useEffect(() => {
    if (!content) return;

    setDisplayedContent("");
    setIsTyping(true);

    const typingSpeed = 20;
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/download-report/newman-report.html"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "newman-report.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatContent = (content) => {
    const lines = content.split("\n");
    return lines.map((line, index) => (
      <div key={index} className="content-line">
        {line}
      </div>
    ));
  };

  return (
    <div className="chatbot-container">
      <div className="response-card">
        <div className="content-wrapper">
          <div className="icon-wrapper">
            <img src={responsePoint} alt="Response Point" />
          </div>

          <div className="content-section">
            <div className="formatted-content">
              {formatContent(displayedContent)}
            </div>

            <div className="action-buttons">
              <button
                className="action-button"
                onClick={handleCopy}
                disabled={isTyping}
              >
                <img src={copyIcon} alt="Copy" />
                Copy
              </button>
              <button
                className="action-button"
                onClick={handleDownload}
                disabled={isTyping}
              >
                <img src={downloadIcon} alt="Download" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="suggestions-section">
          <div className="suggestions-header">
            <div className="icon-wrapper">
              <img src={responsePoint} alt="Response Point" />
            </div>
            <span>More suggestions:</span>
          </div>

          <div className="suggestion-list">
            {suggestions.map((suggestion, index) => (
              <button key={index} className="suggestion-button">
                <span>{suggestion}</span>
                <img src={arrowIcon} alt="Arrow" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotResponse;
