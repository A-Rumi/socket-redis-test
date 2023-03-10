const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;
const { createClient } = require("redis");
const adapter = require("socket.io-redis");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let redisClients;

server.listen(port, () => {
  console.log(`app listening on port ${port}!!`);
  redisClients = settingRedisClientList();
});

const redisUrl = [
  "redis://dev-redis-tcloud-store-cache.bigwu2.clustercfg.apn2.cache.amazonaws.com:6379",
  "redis://dev-cache.bigwu2.0001.apn2.cache.amazonaws.com:6379",
];

const settingRedisClientList = () => {
  return redisUrl.map((url) => {
    const pubClient = createClient({
      url: url,
    });
    const subClient = pubClient.duplicate();

    const opts = {
      pubClient: pubClient,
      subClient: subClient,
    };

    const redisAdapter = adapter(opts);

    return redisAdapter;
  });
};

io.on("connection", (socket) => {
  const storeCode = socket.handshake.query.storeCode;

  if (storeCode) {
    switch (storeCode) {
      case "TEST_TPAY_003":
        console.log(1,socket.id)
        io.adapter(redisClients[0]).emit("storeCode", 'hello')
          console.log(2)
        break;
      case "TEST_TPAY_001":
        io.adapter(redisClients[1]).emit("storeCode", storeCode);
        break;
    }
  }
});
