var httpProxy = require('http-proxy'),
    fs = require('fs'),
    url = require('url');

// tls proxy port
var tlsPort = 5053;
// hostname white list - TODO: may lookup DNS to get available aliases
var hostNames = ['localhost', 'lw5-hku1-bio.dsone.3ds.com'];

// make 'http' to 'https' of location header if it redirects back to
// the same proxy server.
function fixRedirectUrlScheme(proxyRes) {
  if (proxyRes.headers['location']) {
    var loc = url.parse(proxyRes.headers['location']);
    if (loc.protocol == 'http:' && loc.port == tlsPort) {
      if (hostNames.indexOf(loc.hostname.toLowerCase()) >= 0) {
        loc.protocol = 'https:';
        proxyRes.headers['location'] = loc.format();
        console.log('### http -> https: ' + loc.protocol + loc.host + loc.path + ' ...');
      }
    }
  }
}

function logger(proxyRes, req, res) {
  console.log('req: ' + req.url);
  if (!req.url.match(/\/(assets\/|notifications)/)) {
    console.log('  req headers: ' + JSON.stringify(req.headers, true, 2));
    console.log('  res headers: ' + JSON.stringify(proxyRes.headers, true, 2));
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
tlsProxy.on('proxyRes', fixRedirectUrlScheme);
tlsProxy.on('proxyRes', logger);

// http proxy
var proxy = httpProxy.createProxyServer({
  target: 'http://localhost:8080',
  // xfwd: true
}).listen(5050);
proxy.on('proxyRes', logger);

// global error handling
process.on('uncaughtException', function (err) {
    console.log(err);
});
