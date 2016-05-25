var httpProxy = require('http-proxy'),
    fs = require('fs');
// https proxy
var tlsProxy = httpProxy.createProxyServer({
  target: 'https://localhost:8443',
  ssl: {
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8'),
    passphrase: 'changeme'
  },
  secure: false,
  // xfwd: true,
  // autoRewrite: true,
  // protocolRewrite: 'https'
}).listen(5053);
tlsProxy.on('proxyRes', function(proxyRes, req, res) {
  console.log('req: ' + req.url);
  if (!req.url.match(/\/assets\//)) {
    console.log('  req headers: ' + JSON.stringify(req.headers, true, 2));
    console.log('  res headers: ' + JSON.stringify(proxyRes.headers, true, 2));
  }
});

// http proxy
var proxy = httpProxy.createProxyServer({
  target: 'http://localhost:8080',
  // xfwd: true
}).listen(5050);

proxy.on('proxyRes', function(proxyRes, req, res) {
  console.log('req: ' + req.url);
  if (!req.url.match(/\/assets\//)) {
    console.log('  req headers: ' + JSON.stringify(req.headers, true, 2));
    console.log('  res headers: ' + JSON.stringify(proxyRes.headers, true, 2));
  }
});

// global error handling
process.on('uncaughtException', function (err) {
    console.log(err);
});
