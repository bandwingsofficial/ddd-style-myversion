const https = require("https");
const fs = require("fs");
const path = require("path");
const next = require("next");

const port = 3002;
const hostname = "customer.dev.local";
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(
    path.join(__dirname, "certs", "customer.dev.local-key.pem")
  ),
  cert: fs.readFileSync(
    path.join(__dirname, "certs", "customer.dev.local.pem")
  ),
};

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      handle(req, res);
    })
    .listen(port, () => {
      console.log(
        `✅ Customer Web running at https://${hostname}:${port}`
      );
    });
});
