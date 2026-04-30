import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children, hospitalId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Effect 1: Connect once on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: { token }
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.close();
    };
  }, []); // empty — connect once only

  // Effect 2: Join room when hospitalId becomes available
  useEffect(() => {
    if (!socket || !hospitalId) return;
    console.log("🏥 Joining room:", hospitalId);
    socket.emit("join_hospital", hospitalId);
  }, [socket, hospitalId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);