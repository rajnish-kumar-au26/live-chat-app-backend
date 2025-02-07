const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const app = express();
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

app.use(
  cors({
    origin: "*",
  })
);
dotenv.config();

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { CURSOR_FLAGS } = require("mongodb");

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

app.get("/", (req, res) => {
  res.send("API is running123");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server is Running on port ${PORT}`)
);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("setup", (user) => {
    if (user && user.data && user.data._id) {
      socket.join(user.data._id);
      console.log(`User joined: ${user.data._id}`);
      socket.emit("connected");
    } else {
      console.log("Invalid user data");
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`Joined room: ${room}`);
  });

  socket.on("new message", (newMessageStatus) => {
    const chat = newMessageStatus.chat;
    if (!chat || !chat.users) {
      return console.log("Chat or chat users not found");
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageStatus.sender._id) return;
      socket.in(user._id).emit("message received", newMessageStatus);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// const server = app.listen(
//   PORT,
//   console.log(`Server is Running on port ${PORT}`)
// );

// const io = require("socket.io")(server, {
//   cors: {
//     origin: "*",
//   },
//   pingTimeout: 60000,
// });

// io.on("connection", (socket) => {
//   console.log("Socket connected");

//   socket.on("setup", (user) => {
//     if (user && user.data && user.data._id) {
//       socket.join(user.data._id);
//       console.log(`User joined: ${user.data._id}`);
//       socket.emit("connected");
//     } else {
//       console.log("Invalid user data");
//     }
//   });

//   socket.on("join chat", (room) => {
//     socket.join(room);
//     console.log(`Joined room: ${room}`);
//   });

//   socket.on("new message", (newMessageStatus) => {
//     const chat = newMessageStatus.chat;
//     if (!chat || !chat.users) {
//       return console.log("Chat or chat users not found");
//     }

//     chat.users.forEach((user) => {
//       if (user._id === newMessageStatus.sender._id) return;
//       socket.in(user._id).emit("message received", newMessageStatus);
//     });
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
