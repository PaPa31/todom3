const http = require("http");
const fs = require("fs");

let html;
let css;

let darkToggle;
let fileSaver;
let listOrder;
let marked;
let scripts;
let states;

fs.readFile("./index.html", function (err, data) {
  if (err) {
    throw err;
  }
  html = data;
});

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

http
  .createServer((req, res) => {
    res.statusCode = 200;

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
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(html);
    res.end();
  })
  .listen(8080);
