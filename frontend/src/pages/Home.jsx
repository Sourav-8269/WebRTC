import React, { useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [email, setEmail] = React.useState("");
  const [room, setRoom] = React.useState("");
  const socket = useSocket();  
  const navigate = useNavigate();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    socket.emit("join_room", { email, room });
  }, [room, email, socket]);

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data;
    navigate(`/room/${room}`);
    console.log("Join Room Data:", data);
  }, [navigate]);

  useEffect(() => {
    socket.on("join_room", handleJoinRoom);
    return () => {
      socket.off("join_room", handleJoinRoom);
    }
  }, [socket]);
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Join Room</h1>
        <label htmlFor="email">Email ID</label>
        <input type="email" name="" id="email" onChange={(e) => setEmail(e.target.value)} value={email} />
        <br/>
        <label htmlFor="room">Room ID</label>
        <input type="text" name="" id="room" onChange={(e) => setRoom(e.target.value)} value={room} />
        <br/>
        <button>Join</button>
      </form>
    </div>
  );
};

export default Home;
