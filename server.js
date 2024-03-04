const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors()); // Enable CORS for all routes

app.get("/", async (req, res) => {
  try {
    const rootPath = path.join(__dirname); // Change this to the actual root path
    const files = await fs.readdir(rootPath);

    const htmlContent = `
      <h1>Server Root Folder</h1>
      <ul>
        ${files
          .map(
            (file) =>
              `<li><a href="/open-directory?path=${file}">${file}</a></li>`
          )
          .join("")}
      </ul>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/open-directory", async (req, res) => {
  try {
    const directoryPath = req.query.path;
    const fullPath = path.join(__dirname, directoryPath);
    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const files = await fs.readdir(fullPath);

      const htmlContent = `
        <h1>${directoryPath}</h1>
        <button onclick="window.history.back()">Go Back</button>
        <ul>
          ${files
            .map(
              (file) =>
                `<li><a href="/open-directory?path=${path.join(
                  directoryPath,
                  file
                )}">${file}</a></li>`
            )
            .join("")}
        </ul>
      `;

      res.send(htmlContent);
    } else {
      // If it's a file, directly open it
      const fileContent = await fs.readFile(fullPath, "utf-8");

      const ext = path.extname(fullPath).substring(1).toLowerCase();
      const mimeType = getMimeType(ext);

      res.writeHead(200, {
        "Content-type": mimeType,
      });

      res.end(fileContent);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

function getMimeType(ext) {
  const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
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
