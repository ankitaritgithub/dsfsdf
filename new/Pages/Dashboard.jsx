import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip } from "lucide-react";
import "./Dashboard.css";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import UploadFile from "../Components/UploadFile";
import WelcomeModal from "../Components/WelcomeModal";
import ChatbotResponse from "../Components/chatbotresponse";
import dashboardArrow from "../assets/dashboaredarrow.svg";
import apitestingIcon from "../assets/apitestingicons.svg";
import guitestingIcon from "../assets/guitestingagent.svg";
import microphoneIcon from "../assets/Microphone.svg";
import { useChatContext } from "../utils/chatHistoryUtils";
import { v4 as uuid } from "uuid";
import {
  createSearchParams,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const Dashboard = () => {
  const { selectedChatId, setSelectedChatId, saveChatToHistory, getChatById } =
    useChatContext();

  const features = {
    "API Testing Agent": [
      "Generate the test cases for on-boarding flow",
      "Generate and run the test cases from the given swagger file",
      "Generate and run the test cases from the given swagger file",
    ],
    "GUI Testing Agent": [
      "Generate and run the test cases from the given swagger file",
      "Generate and run the test cases from the given swagger file",
      "Generate and run the test cases from the given swagger file",
    ],
  };

  const INACTIVITY_TIMEOUT = 1 * 60 * 1000;

  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isDrop, setIsDrop] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isFileProcessed, setIsFileProcessed] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isChatActive, setIsChatActive] = useState(false);
  const wsRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [chatSessionId, setChatSessionId] = useState(null);

  const navigate = useNavigate();

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket closed due to inactivity");
        wsRef.current.close();
      }
    }, INACTIVITY_TIMEOUT);
  }, []);

  const saveAssistantMessage = (message) => {
    // Define the function logic here
    console.log("Saving assistant message:", message);
  };

  const startNewChat = () => {
    // Define the function logic here
    console.log("Starting new chat");
  };

  useEffect(() => {
    const resetTimerEvents = ["mousemove", "keydown", "click"];
    const resetTimerHandler = resetInactivityTimer;

    resetTimerEvents.forEach((event) => {
      window.addEventListener(event, resetTimerHandler);
    });

    const createWebSocket = () => {
      wsRef.current = new WebSocket("ws://localhost:8000/ws/process_task");

      wsRef.current.onopen = () => {
        console.log("WebSocket connection established");

        resetInactivityTimer();
      };

      wsRef.current.onmessage = (event) => {
        resetInactivityTimer();

        const response = JSON.parse(event.data);
        if (response?.chat_history) {
          const responseObj = response?.chat_history?.filter(
            (item) => item?.role !== "user"
          );

          setChatHistory((prev) => [...prev, ...responseObj]);

          // Save assistant messages to history
          responseObj.forEach((msg) => {
            if (msg.role === "assistant") {
              saveAssistantMessage(msg.content, selectedChatId);
            }
          });
        }
        setIsLoading(false);
        setUploadProgress(0);
      };
      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsLoading(false);
        setUploadProgress(0);
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket connection closed", event);
        setTimeout(createWebSocket, 5000);
      };
    };

    createWebSocket();

    // Reset timer initially
    resetInactivityTimer();

    return () => {
      // Cleanup: remove event listeners and clear timer
      resetTimerEvents.forEach((event) => {
        window.removeEventListener(event, resetTimerHandler);
      });

      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [resetInactivityTimer]);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.toString().split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setIsFileProcessed(true);
    setUploadProgress(100);
  };

  const handleDrop = () => {
    setIsDrop(!isDrop);
  };

  const handleStartNewChat = (chatId) => {
    if (chatId) {
      setChatSessionId(chatId);
      const chat = getChatById(chatId);
      setChatHistory(chat?.messages || []);
      setIsChatActive(true)
    } else {
      const randomid = uuid();
      navigate({
        pathname: "/dashboard",
        search: createSearchParams({
          id: randomid,
        }).toString(),
      });

      setChatHistory([])
      setChatSessionId(randomid);
      initializeSession([], randomid);
      setIsChatActive(false)
    }
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (!message && !selectedFile) return;

    setIsLoading(true);
    setIsChatActive(true);
    try {
      let fileContent = [];
      let fileName = '';



      if (selectedFile?.length) {
        try {
          fileContent = selectedFile.map(file => ({
            file_extension: file.file_extension,
            content: file.content
          }));
          fileName = selectedFile[0].name;
        } catch (error) {
          console.error("Error processing selected files:", error);
          throw new Error("Failed to process file");
        }
      }

      const requestBody = {
        prompt: message,
        file_content: fileContent
      };

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // resetInactivityTimer();

        wsRef.current.send(JSON.stringify(requestBody));


        const userMessage = {
          content: message,
          role: "user",
          name: fileName,
        };

        // Update chat history
        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory(updatedHistory);

        console.log("updated history --", updatedHistory);

        // Clear input after sending
        setMessage("");
        setSelectedFile(null);
        setIsDrop(false);
      } else {
        console.error("WebSocket is not open yet");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { content: `Error: ${error.message}`, role: "system", name: "Error" },
      ]);
    }
  };

  const FeatureCard = ({ title, items, icon }) => (
    <div className="feature-card">
      <div
        className="feature-header"
        data-type={title.toLowerCase().split(" ")[0]}
      >
        <img src={icon} alt={title} className="feature-icon" />
        <h3>{title}</h3>
      </div>
      <div className="feature-items">
        {items.map((item, index) => (
          <div key={index} className="feature-item">
            <span>{item}</span>
            <img src={dashboardArrow} alt="arrow" className="arrow-icon" />
          </div>
        ))}
      </div>
    </div>
  );

  async function initializeSession(messages, chatId) {
    await saveChatToHistory(messages, chatId);
  }

  useEffect(() => {
    const params = searchParams.get("id");

    if (params === null || params === "") {
      // set search params
      let randomId = uuid();
      setChatSessionId(randomId); // returns a random id
      setSearchParams({
        id: randomId,
      });
      // set session data
      initializeSession(chatHistory, randomId);
    }

    // if (chatHistory.length === 0 && chatSessionId === null) {
    //   let randomId = uuid(); // returns a random id
    //   setSelectedChatId(randomId);
    //   navigate({
    //     pathname: "/dashboard",
    //     search: createSearchParams({
    //       id: randomId,
    //     }).toString(),
    //   });
    // }
  }, []);

  const handleChangeMessage = (e) => {
    setMessage(e.target.value)
  }

  useEffect(() => {
    if (chatSessionId) {
      if (chatHistory.length !== 0) {
        initializeSession(chatHistory, chatSessionId);
      }
    }
  }, [chatHistory]);

  return (
    <div className="dashboard-container">
      <WelcomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {/* <Navbar /> */}
      <div className="main-content">
        <Sidebar onStartNewChat={handleStartNewChat} />
        <div className="dashboard-content">
          {isDrop && (
            <UploadFile
              onClose={() => setIsDrop(false)}
              onFileSelect={handleFileSelect}
              wsRef={wsRef}
            />
          )}
          {!isChatActive && (
            <>
              <div className="dashboard-overlay-block-1"></div>
              <div className="dashboard-overlay-block-2"></div>
              <div className="header">
                <h1 className="main-title">
                  Unveiling the Power of Test Case Generation
                  <br />
                  and Execution
                </h1>
                <p className="subtitle">
                  Software testing with automated case generation, execution,
                  and meticulous scrutiny, ensuring precision and efficiency in
                  development workflows.
                </p>
              </div>

              <div className="features-section">
                <h2>Try out our Features</h2>

                <div className="features-grid">
                  <FeatureCard
                    title="API Testing Agent"
                    items={features["API Testing Agent"]}
                    icon={apitestingIcon}
                  />
                  <FeatureCard
                    title="GUI Testing Agent"
                    items={features["GUI Testing Agent"]}
                    icon={guitestingIcon}
                  />
                </div>
              </div>
            </>
          )}
          <div className={`chat-section ${isChatActive ? "active" : ""}`}>
            <div className="chat-input">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  value={message}
                  onChange={handleChangeMessage}
                  placeholder="How can I help you?"
                  className="chat-textfield"
                />
                {selectedFile && selectedFile?.length && selectedFile.map(item => {
                  return (
                    <div className="selected-file-placeholder">
                      Selected file: {item?.name}
                    </div>
                  )
                })}
              </div>
              <div className="attachment-buttons">
                <div className="chat-actions">
                  <button
                    className="icon-button"
                    disabled={isLoading}
                    onClick={() => setIsDrop(true)}
                  >
                    <Paperclip size={20} />
                  </button>
                  <button className="icon-button" disabled={isLoading}>
                    <img
                      src={microphoneIcon}
                      alt="microphone"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
                <button
                  className="send-button"
                  onClick={handleSubmit}
                  disabled={isLoading || (!message && !selectedFile)}
                >
                  <Send size={16} /> {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
            <div className="chat-messages">
              {chatHistory.map((message, index) => {
                if (message.role === "user") {
                  return (
                    <div key={index} className="user-message">
                      <span>{message.content}</span>
                    </div>
                  );
                } else {
                  return (
                    <ChatbotResponse
                      key={index}
                      content={message.content}
                      suggestions={
                        message.suggestions || [
                          "Give more email and passwords",
                          "Perform testing with the data",
                        ]
                      }
                    />
                  );
                }
              })}
              {isLoading && (
                <div className="loading-message">
                  <div className="loading-spinner"></div>
                  <span>Generating response...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
