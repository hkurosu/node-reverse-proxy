var httpProxy = require('http-proxy'),
    fs = require('fs'),
    url = require('url');

// tls proxy port
var tlsPort = 5053;
// hostname white list
var hostNames = ['localhost', 'lw5-hku1-bio.dsone.3ds.com'];

function fixRedirectUrl(proxyRes) {
  if (proxyRes.headers['location']) {
    var loc = url.parse(proxyRes.headers['location']);
    if (loc.protocol == 'http:' && loc.port == tlsPort) {
      if (hostNames.indexOf(loc.hostname) >= 0) {
        loc.protocol = 'https:';
        proxyRes.headers['location'] = loc.format();
        console.log('### http -> https: ' + loc.protocol + loc.host + loc.path + ' ...');
      }
    }
  }
}

// https proxy (https -> http)
var tlsProxy = httpProxy.createProxyServer({
  target: 'http://localhost:8080',
  ssl: {
    key: fs.readFileSync('key.pem', 'utf8'),
    cert: fs.readFileSync('cert.pem', 'utf8'),
    passphrase: 'changeme'
  },
  // secure: false,
  // xfwd: true,
}).listen(tlsPort);
tlsProxy.on('proxyRes', function(proxyRes, req, res) {
  console.log('req: ' + req.url);

  // hack location header
  fixRedirectUrl(proxyRes);
  
  if (!req.url.match(/\/(assets\/|notifications)/)) {
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
