const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
const multer = require("multer");

const app = express();
const PORT = 8000;

app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, "")));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "..")));

const upload = multer({ dest: "uploads/" }); // Define the upload directory

// Middleware function to log requested files
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`${req.method} ${req.url} ${res.statusCode}`);
    originalSend.apply(res, arguments);
  };
  next();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route to handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  // File is automatically saved in the 'uploads' directory
  res
    .status(200)
    .json({ success: true, message: "File uploaded successfully" });
});

app.get("/open-directory", async (req, res) => {
  try {
    const directoryPath = req.query.path || "";
    const fullPath = path.join(__dirname, directoryPath);

    const stats = await fs.stat(fullPath);

    if (stats.isDirectory()) {
      const files = await fs.readdir(fullPath);

      const response = {
        success: true,
        tree: await Promise.all(
          files.map(async (file) => ({
            name: file,
            isDirectory: (
              await fs.stat(path.join(fullPath, file))
            ).isDirectory(),
          }))
        ),
      };

      res.json(response);
    } else {
      const fileContent = await fs.readFile(fullPath, "utf-8");

      const ext = path.extname(fullPath).substring(1).toLowerCase();
      const mimeType = getMimeType(ext);

      res.writeHead(200, {
        "Content-type": mimeType + "; charset=UTF-8",
      });

      res.end(fileContent);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
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
