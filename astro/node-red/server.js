const http = require("http");
const express = require("express");
const RED = require("node-red");

const app = express();
const server = http.createServer(app);

// Tạo runtime cho Node-RED
const settings = {
  httpAdminRoot: "/",
  httpNodeRoot: "/api",
  userDir: "./",
  flowFile: "flows.json",
  functionGlobalContext: {},
};

// Khởi động Node-RED
RED.init(server, settings);

// Gắn Node-RED vào Express
app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);

// Start server
server.listen(process.env.PORT || 1880, () => {
  console.log("Node-RED is running");
});

// Start runtime
RED.start();
