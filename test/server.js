const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Use a dummy base for parsing relative URLs
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname === "/files") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        files: [
          {
            file: "imagen_1.jpg",
            size: 204800,
          },
          {
            file: "imagen_2.jpg",
            size: 10240,
          },
          {
            file: "imagen_3.jpg",
            size: 10240,
          },
          {
            file: "imagen_4.jpg",
            size: 10240,
          },
        ],
        has_more: false,
        total: 4,
      }),
    );
  } else if (pathname === "/download") {
    const file = parsedUrl.searchParams.get("file");

    console.log(file);
    if (!file) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end('Missing "file" query parameter');
      return;
    }

    // Basic path traversal protection
    const safeFile = path.basename(file);
    const filePath = path.join(__dirname, safeFile);
    console.log(filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");
      return;
    }
    console.log(filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading file");
        return;
      }

      // Determine content type (basic)
      let contentType = "application/octet-stream";
      if (safeFile.endsWith(".jpg")) {
        contentType = "image/jpg";
      } else if (safeFile.endsWith(".png")) {
        contentType = "image/png";
      } else if (safeFile.endsWith(".txt")) {
        contentType = "text/plain";
      }

      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
