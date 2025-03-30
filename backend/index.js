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
    socket.to(room).emit("user_joined", {email, id: socket.id});
    socket.join(room);
    io.to(socket.id).emit("join_room", data);
  });

  // socket.on("call_user", ({offer, to}) => {
  //   console.log(offer, to);
  //   io.to(to).emit("incoming_call", {
  //     offer,
  //     from: socket.id,
  //   });
  //   // const socketId = emailToSocketId.get(to);
  //   // if (socketId) {
  //   //   socket.to(socketId).emit("call_user", {
  //   //     offer,
  //   //     from: socket.id,
  //   //   });
  //   // }
  // });

  socket.on("call_user", ({ to, offer }) => {
    console.log("Data from Icoming call", to, offer);
    io.to(to).emit("incomming_call", { from: socket.id, offer });
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