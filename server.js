const express = require("express");
const path = require("path");
const fs = require("fs");
if (!fs.promises) {
  fs.promises = require("fs").promises;
}
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

//app.get("/", async (req, res) => {
//  try {
//    const rootPath = path.join(__dirname); // Change this to the actual root path
//    const files = await fs.readdir(rootPath);

//    const htmlContent = `
//      <h1>Server Root Folder</h1>
//      <ul>
//        ${files
//          .map(
//            (file) =>
//              `<li><a href="/open-directory?path=${encodeURIComponent(
//                file
//              )}">${file}</a></li>`
//          )
//          .join("")}
//      </ul>
//    `;

//    res.send(htmlContent);
//  } catch (error) {
//    console.error(error);
//    res.status(500).send("Internal Server Error");
//  }
//});

app.get("/open-directory", async (req, res) => {
  try {
    const directoryPath = req.query.path || "";
    const fullPath = path.join(__dirname, directoryPath);

    // Use asynchronous file system operations
    const stats = await fs.promises.stat(fullPath);

    if (stats.isDirectory()) {
      const files = await fs.promises.readdir(fullPath);

      const response = {
        success: true,
        tree: await Promise.all(
          files.map(async (file) => ({
            name: file,
            isDirectory: (
              await fs.promises.stat(path.join(fullPath, file))
            ).isDirectory(),
          }))
        ),
      };

      res.json(response);
    } else {
      // If it's a file, directly open it
      const fileContent = await fs.promises.readFile(fullPath, "utf-8");

      const ext = path.extname(fullPath).substring(1).toLowerCase();
      const mimeType = getMimeType(ext);

      res.writeHead(200, {
        "Content-type": mimeType + "; charset=UTF-8",
      });

      res.end(fileContent);
    }
  } catch (error) {
    console.error(error); // Log the error details
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message, // Add the error message to the response
    });
  }
});

function getMimeType(ext) {
  const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
    json: "application/json",
    md: "text/markdown",
  };
  return MIME_TYPES[ext] || MIME_TYPES.default;
}

app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`);
});
