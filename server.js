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
};

//const STATIC_PATH = path.join(process.cwd(), "./static");
const STATIC_PATH = path.join(process.cwd(), "");

const toBool = [() => true, () => false];

let html;
let css;

let darkToggle;
let fileSaver;
let listOrder;
let marked;
let scripts;
let states;

fs.readFile("./css/styles.css", function (err, data) {
  if (err) {
    throw err;
  }
  css = data;
});

fs.readFile("./js/dark-toggle.js", function (err, data) {
  if (err) {
    throw err;
  }
  darkToggle = data;
});

fs.readFile("./js/FileSaver.min.js", function (err, data) {
  if (err) {
    throw err;
  }
  fileSaver = data;
});

fs.readFile("./js/list-order.js", function (err, data) {
  if (err) {
    throw err;
  }
  listOrder = data;
});

fs.readFile("./js/marked.min.js", function (err, data) {
  if (err) {
    throw err;
  }
  marked = data;
});

fs.readFile("./js/scripts.js", function (err, data) {
  if (err) {
    throw err;
  }
  scripts = data;
});

fs.readFile("./js/states.js", function (err, data) {
  if (err) {
    throw err;
  }
  states = data;
});

fs.readFile("./index.html", function (err, data) {
  if (err) {
    throw err;
  }
  html = data;
});

const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];
  if (url.endsWith("/")) paths.push("index.html");
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
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

    //res.statusCode = 200;
    res.statusCode = statusCode;
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    // Set the Content-Length header

    if (req.url.indexOf("dark-toggle.js") != -1) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(darkToggle);
      res.end();
      return;
    }

    if (req.url.indexOf("FileSaver.min.js") != -1) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(fileSaver);
      res.end();
      return;
    }

    if (req.url.indexOf("list-order.js") != -1) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(listOrder);
      res.end();
      return;
    }

    if (req.url.indexOf("marked.min.js") != -1) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(marked);
      res.end();
      return;
    }

    if (req.url.indexOf("scripts.js") != -1) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(scripts);
      res.end();
      return;
    }

    if (req.url.indexOf("states.js") != -1) {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(states);
      res.end();
      return;
    }

    if (req.url.indexOf("styles.css") != -1) {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.write(css);
      res.end();
      return;
    }

    if (req.url.indexOf("index.html") != -1) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
      return;
    }

    res.writeHead(statusCode, {
      "Content-type": mimeType,
      "Content-Length": fileSize,
    });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
