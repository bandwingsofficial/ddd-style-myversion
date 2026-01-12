const { createServer } = require('https');
const { parse } = require('url');
const fs = require('fs');
const next = require('next');

const dev = true;
const app = next({ dev, hostname: 'admin.dev.local', port: 3001});
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('./certs/admin.dev.local+1-key.pem'),
  cert: fs.readFileSync('./certs/admin.dev.local+1.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3001,() => {
    console.log('🚀 Admin running at https://admin.dev.local:3001');
  });
});
