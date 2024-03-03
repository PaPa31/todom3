const http = require("http");
const fs = require("fs");
const path = require("path");

//import { createServer } from "http";
//import { readFile } from "fs";

const PORT = 8000;

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
};

const STATIC_PATH = path.join(process.cwd(), "");

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];
  if (url.endsWith("/")) paths.push("index.html");
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const isDirectory = (
    await fs.promises.stat(filePath).catch(() => {})
  )?.isDirectory();
  const found =
    !pathTraversal && (await fs.promises.access(filePath).then(...toBool));

  let streamPath = found ? filePath : STATIC_PATH + "/404.html";
  let ext = path.extname(streamPath).substring(1).toLowerCase();

  if (isDirectory && !url.endsWith("/")) {
    // Exclude index.html only if it's not a directory request
    const files = await fs.promises.readdir(filePath);
    // Exclude index.html from the list
    const filteredFiles = files.filter((file) => file !== "index.html");
    const jsonFiles = JSON.stringify(filteredFiles);
    streamPath = path.join(filePath, "index.html");
    fs.writeFileSync(streamPath, jsonFiles, "utf-8");
    ext = "html";
    mimeType = MIME_TYPES["json"]; // Set Content-Type to "application/json"
  }

  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

http
  .createServer(async (req, res) => {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    const fileSize = file.found
      ? fs.statSync(`${__dirname}` + `${req.url}`).size
      : null;

    res.statusCode = statusCode;
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    //// Conditionally set Content-Length only for file responses
    //if (file.found) {
    //  res.setHeader("Content-Length", fileSize);
    //}

    res.writeHead(statusCode, {
      "Content-type": mimeType,
      //"Content-Length": fileSize,
    });

    if (file.ext === "json") {
      // If the response is a JSON file, convert the buffer to a string and then write it
      res.write(file.stream.toString());
    } else {
      // For other file types, pipe the stream
      file.stream.pipe(res);
    }

    console.log(`${req.method} ${req.url} ${statusCode}`);
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
