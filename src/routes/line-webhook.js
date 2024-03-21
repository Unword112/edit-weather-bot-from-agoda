const express = require("express");
const line = require("@line/bot-sdk");

const { handleEvent } = require("../line/messageHandler");

const router = express.Router();

const config = {
  channelAccessToken:
    "aKywPjeY8vPcj9BqMecPdtY/o3bp7R6r5tpyksDJeohF75SEtBmqI4qL/zRo8DcOonHyHqnbziab5mLZqm1NxNSf4Sm0hnvWMrYU9duI7E3v1lnTmAKhXoG33yQRHr/vBHyr46GYWQtt717IYqKxcQdB04t89/1O/w1cDnyilFU=",
  channelSecret: "d51d4279e04f537e949b4f879894c758",
};

router.post("/", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result),
  );
});

module.exports = router;
