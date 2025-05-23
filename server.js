const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, "")));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "..")));

// Add this line to parse incoming JSON requests
app.use(express.json());

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

app.post("/save-file", async (req, res) => {
  try {
    const { fileName, fileContent, overwrite } = req.body;
    const fullPath = path.join(__dirname, fileName);

    // Check if the file already exists, unless overwrite is true
    if (!overwrite) {
      try {
        // Check if the file exists using fs.promises.stat
        await fs.stat(fullPath); // This will throw an error if the file doesn't exist

        // If the file exists and overwrite is false, return a 409 Conflict
        return res
          .status(409)
          .json({ success: false, message: "File already exists." });
      } catch (err) {
        if (err.code !== "ENOENT") {
          // If it's another error, rethrow it
          throw err;
        }
        // If ENOENT, continue to save the file
      }
    }

    // Ensure the directory exists before writing the file
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Save (or overwrite) the file
    await fs.writeFile(fullPath, fileContent, "utf8");

    res
      .status(200)
      .json({ success: true, message: "File saved successfully." });
  } catch (error) {
    console.error("Error saving file: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to save the file." });
  }
});

app.post("/create-folder", async (req, res) => {
  const { directory, folderName } = req.body;
  const fullPath = path.join(__dirname, directory, folderName);

  try {
    await fs.mkdir(fullPath, { recursive: true }); // Ensure the directory is created
    res
      .status(200)
      .json({ success: true, message: "Folder created successfully" });
  } catch (error) {
    console.error("Error creating folder:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create folder" });
  }
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
