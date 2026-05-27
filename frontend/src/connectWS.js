import { io } from "socket.io-client";

 export function connectWS(){

  return io("http://localhost:4600");
    //return io("https://web-socket-group-chat-production.up.railway.app");
 }