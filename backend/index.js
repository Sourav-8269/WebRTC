const { Server } = require("socket.io");

const io = new Server(8080, {
  cors: true,
});

const emailToSocketId = new Map();
const socketIdToEmail = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  socket.on("join_room", (data) => {
    console.log(data);
    const { email, room } = data;
    emailToSocketId.set(email, socket.id);
    socketIdToEmail.set(socket.id, email);
    // socket.join(data.room);
    // socket.to(data.room).emit("user_joined", data.email);
    io.to(socket.id).emit("join_room", data);
  });
  socket.on("send_message", (data) => {
    console.log(data);
    socket.to(data.room).emit("receive_message", data.message);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected", socket.id);
  });
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});