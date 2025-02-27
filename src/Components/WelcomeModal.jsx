import React, { useState } from 'react';
import './WelcomeModal.css';
import welcomeStartModel from '../assets/welcomesstartmodel.svg';
import startnewModel from '../assets/startnewmodel.svg';
import promptModel from '../assets/Promoptmodel.svg';
import inputPromptModel from '../assets/inputpromptmodel.svg';
import promptdirection from '../assets/promptdirection.svg';
import elementIcon from '../assets/Element.svg';

const WelcomeModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  
  if (!isOpen) return null;

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const getStepContent = () => {
    switch(step) {
      case 1:
        return {
          title: "Start",
          description: "Welcome to Agent QA! You can start your journey with QA Agent now to get your GUI & API testing done!",
          image: welcomeStartModel,
          label: "Enter your prompt",
          subtext: "To start new chat for generating test cases",
          buttonText: "Next"
        };
      case 2:
        return {
          title: "Start",
          description: "You can also start we chat from other option as shown below",
          image: startnewModel,
          label: "Click On Start New",
          subtext: "To begin generating test cases",
          buttonText: "Got it"
        };
      case 3:
        return {
          title: "Next Step",
          description: "You will be re-directed to the pages where you can get the response according to the prompt",
          image: promptModel,
          label: "Prompt Page",
          subtext: "Here you can download or copy result",
          buttonText: "Next"
        };
      case 4:
        return {
          title: "Upload File",
          description: "You can upload swagger document (File format) from which you want to get testcases",
          image: inputPromptModel,
          label: "Upload Option",
          subtext: "To start with testcase generation swagger docs",
          buttonText: "Finish"
        };
      case 5:
        return{
          title: "Next Step",
          description: "You will be re-directed to the pages where you can get the response based on Swagger doc prompt.",
          image: promptdirection,
          label: "Prompt Page",
          subtext: "To start with testcase generation with prompt and swagger docs",
          buttonText: "Finish"
        }
      default:
        return {};
    }
  };

  const content = getStepContent();

  const handleButtonClick = () => {
    if (step === 5) {
      onClose();
    } else {
      handleNext();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </div>

        <div className="image-container">
          <img 
            src={content.image}
            alt="Current Step" 
            className="welcome-image" 
          />
        </div>

        <div className="prompt-section">
          <div className="prompt-label">{content.label}</div>
          <div className="prompt-text">{content.subtext}</div>
          <div className="next-container">
            <button className="next-button" onClick={handleButtonClick}>
              {content.buttonText}
              <img src={elementIcon} alt="next" className="next-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
