import { useState, useEffect, useRef } from "react";
import { connectWS } from "../connectWS";

function ChatApp() {

  const socket = useRef(null);

  useEffect(() => {
    socket.current = connectWS();
  }, []);

  return (
    <h2>aeninewgponewgpo</h2>
  );
}

export default ChatApp;