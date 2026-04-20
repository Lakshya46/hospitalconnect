import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, hospitalId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Establish connection
const token = localStorage.getItem("token");
    if (!token) return; // 🛑 Don't connect if we don't have a badge!
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"], // Prioritize websocket for performance
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: { token: localStorage.getItem("token") }
    });

    // 2. Event Listeners for status tracking
    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket:", newSocket.id);
      
      // Re-join room if the connection was dropped and restored
      if (hospitalId) {
        newSocket.emit("join_hospital", hospitalId);
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 3. Dynamic Room Joining
    // If hospitalId changes while socket is already connected
    if (hospitalId && newSocket.connected) {
      newSocket.emit("join_hospital", hospitalId);
    }

    setSocket(newSocket);

    // 4. Cleanup
    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.close();
    };
  }, [hospitalId]);

  return (
    // Providing isConnected allows UI to show "Online/Offline" status
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);