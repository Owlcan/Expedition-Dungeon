const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

const server = http.createServer((req, res) => {
  // Default to index.html if no path specified
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './demo.html';
  }

  // Handle module imports without extensions (add .js)
  if (!path.extname(filePath) && !fs.existsSync(filePath) && fs.existsSync(filePath + '.js')) {
    filePath += '.js';
  }

  const extname = path.extname(filePath);
  // For files in the bestiary folder without extensions, force JavaScript MIME type
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  if (filePath.includes('bestiary/') && !extname) {
    contentType = 'text/javascript';
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        fs.readFile('./404.html', (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content || '404 Not Found', 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Opening the demo in your default browser...`);
  
  // Try to open the browser automatically
  const startCommand = process.platform === 'win32' ? 'start' : 
                      (process.platform === 'darwin' ? 'open' : 'xdg-open');
  require('child_process').exec(`${startCommand} http://localhost:${PORT}/`);
});