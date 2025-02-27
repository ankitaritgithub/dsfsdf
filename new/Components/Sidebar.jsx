import React, { useState, useEffect } from "react";
import { FileText, ChevronDown } from "lucide-react";
import "./Sidebar.css";
import profileImage from "../assets/profileimage.svg";
import dashboardIcon from "../assets/dashboared.svg";
import exploreIcon from "../assets/Exploretoolsicons.svg";
import integrationIcon from "../assets/integrationtoolsicons.svg";
import historyIcon from "../assets/history.svg";
import signoutIcon from "../assets/signout.svg";
import sidebarLeftIcon from "../assets/Sidebar Left.svg";
import settingIcon from "../assets/setting.svg";
import startNewIcon from "../assets/startnew.svg";
import deleteChat from "../assets/Deletechat.svg";
import { useChatContext } from "../utils/chatHistoryUtils";

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
      <button className="start-button" onClick={() => onStartNewChat(null)}>
        <img src={startNewIcon} alt="Start New" width={16} height={16} />
        Start new
      </button>

      <nav className="nav-menu">
        <NavItem icon={FileText} label="Summary" />
        <NavItem
          icon={() => <img src={dashboardIcon} alt="Dashboard" />}
          label="Dashboard"
        />
        <NavItem
          icon={() => <img src={integrationIcon} alt="Integration Tools" />}
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

        {/* <div className="profile-section">
          <div className="profile-content">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <span className="profile-name">Piyush Sonawane</span>
          </div>
          <button className="logout-button">
            <img src={sidebarLeftIcon} alt="Logout" width={16} height={16} />
          </button>
        </div> */}
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
