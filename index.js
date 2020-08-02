let express = require("express");
let bodyParser = require("body-parser");
let configManager = require("./configManager");
let app = express();
let jsonParser = bodyParser.json();

app.post("/", jsonParser, function (req, res) {
  let updatedStateConfig = configManager.MergeConfigObj(req.body);
  res.send(updatedStateConfig);
});
app.listen(3030, function () {
  console.log("Example app listening on port 3030!");
});
