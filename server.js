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
              `<li><a href="/open-directory?path=${encodeURIComponent(
                file
              )}">${file}</a></li>`
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
    const files = await fs.readdir(fullPath);

    const htmlContent = `
      <h1>${directoryPath}</h1>
      <button onclick="window.history.back()">Go Back</button>
      <ul>
        ${files
          .map(
            (file) =>
              `<li><a href="/open-directory?path=${encodeURIComponent(
                path.join(directoryPath, file)
              )}">${file}</a></li>`
          )
          .join("")}
      </ul>
    `;

    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(htmlContent);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`);
});
