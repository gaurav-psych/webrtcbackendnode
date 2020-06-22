const open = require("open");
const listenCallback = serverPort => {
  console.log("server up and running at %s port", serverPort);
  if (process.env.LOCAL) {
    console.log("yes");
    open("https://localhost:" + serverPort);
  } else {
    console.log("here");
  }
};

module.exports = listenCallback;
