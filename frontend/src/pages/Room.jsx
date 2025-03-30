import React, { useCallback, useEffect } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from "react-player";
import peer from '../service/peer';
import { useNavigate } from 'react-router-dom';

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = React.useState(null);
  const [myStream, setMyStream] = React.useState(null);
  const navigate = useNavigate();

  const handleUserJoined = useCallback((data) => {
    const { email, id } = data;
    console.log("User joined", email, id);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log("Stream", stream);
    const offer = await peer.getOffer();
    socket.emit("call_user", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    console.log("Incoming call", offer, from);
  }, [socket]);

  useEffect(() => {
    socket.on("user_joined", handleUserJoined);
    socket.on("incomming_call", handleIncomingCall);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("incomming_call", handleUserJoined);
    };
  }, [socket, handleUserJoined, handleIncomingCall]);

  return (
    <div>
      <h1>Meeting Room</h1>
      <button onClick={() => navigate("/")}>Home</button>
      <h4>{remoteSocketId ? "Connected" : "No one in Room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser} >Call</button>}
      {myStream && <ReactPlayer playing mute height="300px" width="100%" url={myStream} />}
    </div>
  )
}

export default Room