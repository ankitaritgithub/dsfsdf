import React, { useState, useEffect } from "react";
import { FileText, ChevronDown } from "lucide-react";
import "./Sidebar.css";
import dashboardIcon from "../assets/dashboared.svg";
import exploreIcon from "../assets/exploreagent.svg";
import integrationIcon from "../assets/integrationtoolsicons.svg";
import historyIcon from "../assets/history.svg";
import toolsandintegrationIcon from "../assets/Tools and integration.svg";
import signoutIcon from "../assets/Signout.svg";
import settingIcon from "../assets/Settings.svg";
import startNewIcon from "../assets/startnew.svg";
import deleteChat from "../assets/Deletechat.svg";
import { useChatContext } from "../utils/chatHistoryUtils";
import logo from '../assets/logo.svg';
import akiraLogo from '../assets/akira.svg';
import profileImage from '../assets/profileimage.svg';
import sidebarLeft from '../assets/SidebarLeft.svg';
import settingsIcon from '../assets/Settings.svg';


const Sidebar = ({ onStartNewChat }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const { chats, setSelectedChatId, deleteChatFromHistory } = useChatContext();

  const groupChatsByDate = (chats) => {
    if (!Array.isArray(chats)) {
      console.error("Expected chats to be an array, but received:", chats);
      return { Today: [], "Last 7 Days": [], Earlier: [] };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const groups = {
      Today: [],
      "Last 7 Days": [],
      Earlier: [],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp);
      if (chatDate >= today) {
        groups.Earlier.push(chat);
      } else if (chatDate >= last7Days) {
        groups["Last 7 Days"].push(chat);
      } else {
        groups.Today.push(chat);
      }
    });

    return groups;
  };

  const getMessagePreview = (messages) => {
    if (!messages || messages.length === 0) return "";
    const firstMessage = messages[0]; // Get the first message
    const preview = firstMessage.content;
    return preview.length > 40 ? preview.substring(0, 37) + "..." : preview;
  };

  const groupedChats = groupChatsByDate(chats);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-circle">
            <img src={logo} alt="Logo" />
          </div>
          <div className="logo-text">
            <span className="primary-text">AgentQA</span>
            <span className="powered-by">powered by <img src={akiraLogo} alt="Akira" className="akira-logo" /> <strong>akira™</strong></span>
          </div>
        </div>
          <div className="user-profile">
          <div className="avatar">
            <img src={profileImage} alt="User avatar" />
          </div>
          <span className="username">Piyush Sonawane</span>
          <button className="settings-btn">
            <img src={settingsIcon} alt="settings"/>
          </button>
          <button className="sidebarleft-btn">
            <img src={sidebarLeft} alt="sidebarleft"/>
          </button>
        </div>
        </div>
      <button className="start-button" onClick={() => onStartNewChat(null)}>
        <img src={startNewIcon} alt="Start New Chat" />
        Start new
      </button>

      <nav className="nav-menu">
        <NavItem icon={FileText} label="Summary" />
        <NavItem
          icon={() => <img src={dashboardIcon} alt="Dashboard" />}
          label="Dashboard"
        />
        <NavItem
          icon={() => <img src={toolsandintegrationIcon} alt="Integration Tools" />}
          label="Integration Tools"
        />
        <div className="history-section">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="history-button"
          >
            <div className="nav-item-content">
              <img src={historyIcon} alt="History" className="nav-icon" />
              <span>History</span>
            </div>
            <ChevronDown
              className={`chevron-icon ${isHistoryOpen ? "rotate" : ""}`}
            />
          </button>
          {isHistoryOpen && (
            <div className="history-groups">
              {Object.entries(groupedChats).map(
                ([period, periodChats]) =>
                  periodChats.length > 0 && (
                    <div key={period} className="history-period">
                      <div className="period-label">{period}</div>
                      <ul className="history-list">
                        {periodChats.map((chat) => (
                          <li
                            key={chat.id}
                            onClick={() => onStartNewChat(chat.id)}
                            className="history-list-item"
                          >
                            <div className="history-item-content updated-styles">
                              <span className="history-preview">
                                {getMessagePreview(chat.messages)}
                              </span>
                              <button
                                className="delete-chat-btn updated-styles"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteChatFromHistory(chat.id);
                                }}
                              >
                                <img src={deleteChat} alt="Delete Chat" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="bottom-section">
        <div className="bottom-menu">
          <NavItem
            icon={() => <img src={settingIcon} alt="Settings" />}
            label="Settings"
          />
          <NavItem
            icon={() => <img src={exploreIcon} alt="Explore" />}
            label="Explore Agent"
          />
          <NavItem
            icon={() => <img src={signoutIcon} alt="Sign Out" />}
            label="Sign Out"
          />
        </div>        
      </div> 
      </div>
  );
};

const NavItem = ({ icon: Icon, label }) => {
  return (
    <button className="nav-item">
      <div className="nav-item-content">
        {typeof Icon === "function" ? <Icon /> : <Icon className="nav-icon" />}
        <span>{label}</span>
      </div>
    </button>
  );
};

export default Sidebar;
