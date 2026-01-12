const https = require("https");
const fs = require("fs");
const next = require("next");

const app = next({ dev: true });
const handle = app.getRequestHandler();

const PORT = 3000;
const HOST = "outlets.dev.local"; // or outlets.dev.local

const httpsOptions = {
  key: fs.readFileSync("./certs/outlets.dev.local-key.pem"),
  cert: fs.readFileSync("./certs/outlets.dev.local.pem"),
};

app.prepare().then(() => {
  https.createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(PORT, HOST, () => {
    console.log(`🚀 HTTPS server running at https://${HOST}:${PORT}`);
  });
});
