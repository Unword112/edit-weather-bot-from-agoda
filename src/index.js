const express = require("express");
const lineWebhook = require("./routes/line-webhook");
require("./line/schedules");

const app = express();
const port = 3000;

app.use("/webhook/line", lineWebhook);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
