import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CHAT_HISTORY_KEY = "chatHistory";

const ChatContext = createContext();

const existingHistory = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY)) || [];


export const saveChatToHistory = async (messages, chatId = null) => {

  console.log(messages, chatId)
  try {
    const existingHistory = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY)) || [];
    const currentTime = new Date().toISOString();

    const existing = existingHistory.find(entry => entry.id === chatId);

    if (existing) {
      // Update existing chat
      console.log("inside existing")
      const updatedHistory = existingHistory.map(entry => 
        entry.id === chatId 
          ? { 
              ...entry, 
              messages,
              lastUpdated: currentTime
            } 
          : entry
      );

      console.log(updatedHistory)
      
      await sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
      return chatId;
    } else {
      console.log("create new")
      // Create new chat
      const chatEntry = {
        id: chatId,
        created: currentTime,
        lastUpdated: currentTime,
        messages: messages || []
      };

      const updatedHistory = [chatEntry, ...existingHistory];
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
      return chatId;
    }
  } catch (error) {
    console.error("Error saving chat history:", error);
    return null;
  }
};

export const getChatHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY)) || [];
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    return [];
  }
};

export const getChatById = (chatId) => {
  const history = getChatHistory();
  return history.find(chat => chat.id === chatId);
};

export const deleteChatFromHistory = (chatId) => {
  try {
    const existingHistory = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY)) || [];
    const updatedHistory = existingHistory.filter(chat => chat.id !== chatId);
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error deleting chat from history:", error);
  }
};

export const saveChatMessage = (content, role, chatId = null) => {
  try {
    const timestamp = new Date().toISOString();
    const message = { content, role, timestamp };

    const existingHistory = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY)) || [];
    
    if (chatId) {
      // Update existing chat
      const chatEntry = existingHistory.find(entry => entry.id === chatId);
      if (chatEntry) {
        chatEntry.messages.push(message);
        chatEntry.lastUpdated = timestamp;
        const updatedHistory = existingHistory.map(entry => 
          entry.id === chatId ? chatEntry : entry
        );
        sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
        return chatId;
      }
    }
    
    // Create new chat if no chatId or chat not found
    const newChatId = uuidv4();
    const chatEntry = {
      id: newChatId,
      created: timestamp,
      lastUpdated: timestamp,
      messages: [message]
    };
    
    const updatedHistory = [chatEntry, ...existingHistory];
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
    return newChatId;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return null;
  }
};

export const startNewChat = () => {
  const newChatId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const newChat = {
    id: newChatId,
    created: timestamp,
    lastUpdated: timestamp,
    messages: []
  };

  try {
    const existingHistory = JSON.parse(sessionStorage.getItem(CHAT_HISTORY_KEY)) || [];
    const updatedHistory = [newChat, ...existingHistory];
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedHistory));
    return newChatId;
  } catch (error) {
    console.error("Error starting new chat:", error);
    return null;
  }
};

export const getLastMessageFromChat = (messages) => {
  if (!messages || messages.length === 0) return '';
  
  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage.content;
  
  return preview.length > 40 ? preview.substring(0, 37) + '...' : preview;
};

export const saveUserMessage = (content, chatId) => {
  saveChatMessage(content, 'user', chatId);
};

export const saveAssistantMessage = (content, chatId) => {
  saveChatMessage(content, 'assistant', chatId);
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const storedChats = getChatHistory();
    setChats(storedChats);
  }, []);

  const saveChatToHistoryWrapper = (messages, chatId = null) => {
    const chatIdResult = saveChatToHistory(messages, chatId);
    if (chatIdResult !== null) {
      const storedChats = getChatHistory();
      setChats(storedChats);
    }
    return chatIdResult;
  };

  const deleteChatFromHistoryWrapper = (chatId) => {
    deleteChatFromHistory(chatId);
    const storedChats = getChatHistory();
    setChats(storedChats);

    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      selectedChatId,
      setSelectedChatId,
      saveChatToHistory: saveChatToHistoryWrapper,
      getChatById,
      deleteChatFromHistory: deleteChatFromHistoryWrapper,
      getLastMessageFromChat,
      saveUserMessage,
      saveAssistantMessage,
      startNewChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};