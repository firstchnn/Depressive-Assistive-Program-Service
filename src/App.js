const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const db = mongoose.connection;
const app = express();
const PORT = 3000;
app.use(cors());
db.on("error", console.error.bind(console, "MongoDB connection error:"));
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoDB =
  "mongodb+srv://chnw-admin:5wtxlgWw6E0s8l8g@application.boctkj3.mongodb.net/test";

mongoose.connect(
  mongoDB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log("connect to db");
    } else {
      console.log("cannot connect to db", err);
    }
  }
);

const Schema = mongoose.Schema;
const doctorSchema = new Schema({
  name: String,
  tel: String,
  workplace: String,
  expertise: String,
  // educational : Object,
  ovr_rating: String,
  consultantNumber: String,
  // profile_picture : Buffer,
  // review : Object,
});
const Doctors = mongoose.model("Doctors", doctorSchema);

const chatSchema = new mongoose.Schema({
  username: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Chat = mongoose.model("Chat", chatSchema);
const connections = [];

io.on("connection", (socket) => {
  console.log("A user has connected");

  // Add the new socket connection to the connections array
  connections.push(socket);

  // Listen for new chat messages
  socket.on("chat message", (msg) => {
    console.log("New message:", msg);

    // Create a new chat message in the database
    const chat = new Chat({ username: msg.username, message: msg.message });
    chat.save((err) => {
      if (err) {
        console.error(err);
      } else {
        // console.log("Saved message to database:", msg);

        // Emit the new message to all connected clients
        io.emit("chat message", msg);
      }
    });
  });

  // Listen for disconnections
  socket.on("disconnect", () => {
    console.log("A user has disconnected");

    // Remove the socket connection from the connections array
    connections.splice(connections.indexOf(socket), 1);
  });
});

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(__dirname + "/index.html");
});

app.get("/all-doctor", (req, res) => {
  console.log("Getting alldoctor");
  Doctors.find((err, val) => {
    if (err) {
      console.log(err);
    } else {
      console.log(val);
      res.json(val);
    }
  });
});

app.get("/singleDoc/:id", function (req, res) {
  const id = req.params.id;
  Doctors.findById(id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

server.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
