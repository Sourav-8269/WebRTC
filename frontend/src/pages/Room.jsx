import React, { useCallback, useEffect } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from "react-player";
import peer from '../service/peer';
import { useNavigate } from 'react-router-dom';

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = React.useState(null);
  const [myStream, setMyStream] = React.useState(null);
  const [remoteStream, setRemoteStream] = React.useState(null);
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
    setRemoteSocketId(from);
    console.log("Incoming call", offer, from);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMyStream(stream);
    const answer = await peer.getAnswer(offer);
    socket.emit("call_accepted", { to: from, answer });
  }, [socket]);

  const sendStreams = useCallback(()=> {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  },[myStream]);

  const handleCallAccepted = useCallback(async ({ answer }) => {
    // peer.addAnswer(answer);
    // **
    // await peer.peer.setLocalDescription(answer);
    await peer.setLocalDescription(answer);
    console.log("Call accepted", answer);
    sendStreams();
  }, [sendStreams]);

  const handleNegotiationNeeded = useCallback(async () => {
    console.log("Negotiation needed");
    const offer = await peer.getOffer();
    socket.emit("peer_negotiation", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleNegotiationIncoming = useCallback(async ({ from, offer }) => {
    console.log("Negotiation incoming", offer);
    const answer = await peer.getAnswer(offer);
    socket.emit("peer_negotiation_done", { to: from, answer });
  }, [socket]);

  const handleNegotiationFinal = useCallback(async ({ answer }) => {
    console.log("Negotiation final", answer);
    // peer.addAnswer(answer);
    // await peer.peer.setLocalDescription(answer);
    await peer.setLocalDescription(answer);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    return ()=> {
      peer.peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    }
  },[handleNegotiationNeeded])

  useEffect(() => {
    peer.peer.addEventListener("track", (event) => {
      console.log("Track", event.streams);
      console.log("Got Tracks")
      setRemoteStream(event.streams[0]);
    });
  } , []);

  useEffect(() => {
    socket.on("user_joined", handleUserJoined);
    socket.on("incomming_call", handleIncomingCall);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("peer_negotiation", handleNegotiationIncoming);
    socket.on("peer_negotiation_final", handleNegotiationFinal);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("incomming_call", handleUserJoined);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("peer_negotiation", handleNegotiationIncoming);
      socket.off("peer_negotiation_final", handleNegotiationFinal);

    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegotiationIncoming, handleNegotiationFinal]);

  return (
    <div>
      <h1>Meeting Room</h1>
      <button onClick={() => navigate("/")}>Home</button>
      <h4>{remoteSocketId ? "Connected" : "No one in Room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser} >Call</button>}
      {myStream && <button onClick={sendStreams} >Send Stream</button>}
      {myStream && 
        <>
          <h1>Your Stream</h1>
          <ReactPlayer playing mute height="300px" width="100%" url={myStream} />
        </>
      }
      {remoteStream && 
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer playing mute height="300px" width="100%" url={remoteStream} />
        </>
      }
    </div>
  )
}

export default Room