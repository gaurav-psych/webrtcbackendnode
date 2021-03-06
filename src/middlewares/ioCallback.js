module.exports = io => {
  let peopleWhoRaisedHands = [];
  let peoplePausedVideo = [];
  let peopleMuted = [];

  function ioCallback(socket) {
    console.log(`Socket id: ${socket.id}`);
    socket.emit("connect", socket.id);
    socket.on("join", async (roomID, callback) => {
      console.log("join", roomID);
      const socketIds = await socketIdsInRoom(roomID);
      console.log("socketIdsInRoom>>>", socketIds);
      callback(socketIds);
      socket.join(roomID);
      socket.room = roomID;
    });

    socket.on("retrievePeopleWhoRaisedHands", async (roomID, callback) => {
      callback(peopleWhoRaisedHands);
    });
    socket.on("retrievePeopleWhoPausedVideo", async (roomID, callback) => {
      callback(peoplePausedVideo);
    });

    socket.on("retrievePeopleWhoMuted", async (roomID, callback) => {
      callback(peopleMuted);
    });

    socket.on("exchange", data => {
      console.log("exchange");
      data.from = socket.id;
      const to = io.sockets.connected[data.to];
      to.emit("exchange", data);
    });
    socket.on("declineCalling", roomID => {
      console.log("declineCalling");
      io.in(roomID).emit("leave");
      socketIdsInRoom(roomID).then(socketIds => {
        socketIds.forEach(socketId => {
          if (io.sockets.connected[socketId]) {
            io.sockets.connected[socketId].conn.close();
          }
        });
      });
    });
    socket.on("checkRoomIsEmpty", async (roomID, callBack) => {
      console.log("checkRoomIsEmpty ");
      const socketIds = await socketIdsInRoom(roomID);
      callBack(socketIds);
    });
    socket.on("turnOffCamera", data => {
      console.log("turnOnOrOffCamera");
      const to = io.sockets.connected[data.to];
      to.emit("turnOffCamera", data.param);
    });
    socket.on("refuse", socketId => {
      const to = io.sockets.connected[socketId];
      to.emit("refuse");
    });
    socket.on("disconnect", async () => {
      console.log("disconnect");
      if (socket.room) {
        // const room = socket.room;
        // io.to(room).emit("leave", socket.id);
        // socket.leave(room);
        const socketIds = await socketIdsInRoom(socket.room);
        // callBack(socketIds)
        let thePersonHangingSocketId = socket.id;
        socketIds.forEach(socketId => {
          // if (io.sockets.connected[socketId]) {
          //   io.sockets.connected[socketId].conn.close();
          // }

          if (socketId != thePersonHangingSocketId) {
            const to = io.sockets.connected[socketId];
            to.emit("hangUpCallByOthers", thePersonHangingSocketId);
          } else {
          }
        });
      }
    });

    socket.on("hangUpCallByOthers", async roomId => {
      console.log("checkRoomIsEmpty ");
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;
      socketIds.forEach(socketId => {
        // if (io.sockets.connected[socketId]) {
        //   io.sockets.connected[socketId].conn.close();
        // }

        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("hangUpCallByOthers", thePersonHangingSocketId);
        } else {
        }
      });
    });

    socket.on("raiseMyHand", async roomId => {
      console.log("someone has raised hand ");
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;
      peopleWhoRaisedHands.push(thePersonHangingSocketId);
      socketIds.forEach(socketId => {
        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("someoneRaisedHand", thePersonHangingSocketId);
        } else {
        }
      });
    });

    // im sending emit to alland also removing that scoketid from my array
    socket.on("lowerHand", async roomId => {
      console.log("someone has raised hand ");
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;
      let newpeopleWhoRaisedHands = peopleWhoRaisedHands.filter(
        e => e !== thePersonHangingSocketId
      );
      peopleWhoRaisedHands = newpeopleWhoRaisedHands;

      socketIds.forEach(socketId => {
        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("someoneLoweredHand", thePersonHangingSocketId);
        } else {
        }
      });
    });

    socket.on("pauseMyVideo", async roomId => {
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;
      peoplePausedVideo.push(thePersonHangingSocketId);
      socketIds.forEach(socketId => {
        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("someonePausedVideo", thePersonHangingSocketId);
        } else {
        }
      });
    });

    socket.on("unPauseMyVideo", async roomId => {
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;

      let newpeopleUnpausedVideo = peoplePausedVideo.filter(
        e => e !== thePersonHangingSocketId
      );
      peoplePausedVideo = newpeopleUnpausedVideo;
      socketIds.forEach(socketId => {
        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("someoneResumedVideo", thePersonHangingSocketId);
        } else {
        }
      });
    });

    socket.on("muteMyAudio", async roomId => {
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;
      peopleMuted.push(thePersonHangingSocketId);
      socketIds.forEach(socketId => {
        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("someoneMuted", thePersonHangingSocketId);
        } else {
        }
      });
    });

    socket.on("unmuteMyAudio", async roomId => {
      const socketIds = await socketIdsInRoom(roomId);
      // callBack(socketIds)
      let thePersonHangingSocketId = socket.id;

      let newpeopleUnpausedVideo = peopleMuted.filter(
        e => e !== thePersonHangingSocketId
      );
      peopleMuted = newpeopleUnpausedVideo;
      socketIds.forEach(socketId => {
        if (socketId != thePersonHangingSocketId) {
          const to = io.sockets.connected[socketId];
          to.emit("someoneUnmuted", thePersonHangingSocketId);
        } else {
        }
      });
    });
  }

  const socketIdsInRoom = roomID => {
    return new Promise(resolve => {
      io.sockets.in(roomID).clients((err, clients) => {
        resolve(clients);
      });
    });
  };

  return { ioCallback };
};
