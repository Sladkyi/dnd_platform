import React, { createContext, useContext } from 'react';
import { useGlobalSocket } from '../hooks/useGlobalSocket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { socket, isSocketReady } = useGlobalSocket();

  return (
    <SocketContext.Provider value={{ socket, isSocketReady }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
