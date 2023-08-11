const filterVideoIdFromUrl = (url) => {
  var video_id, result;
  if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
    video_id = result.pop();
  } else if ((result = url.match(/youtu.be\/(.{11})/))) {
    video_id = result.pop();
  }
  return video_id;
};

const transformUrl = (jsonStr) => {
  const urlRegex = /https?:\/\/([^\s\/]+)([^\n]*)/g;

  const urlReplacer = function (url) {
    return `<a href="${url}">${url}</a>`;
  };
  const transformedUrl = (url) =>
    urlRegex.test(url) ? url.replaceAll(urlRegex, urlReplacer) : url;

  let lines = jsonStr.split("\n");
  let transformedLines = lines.map((line) => transformedUrl(line)).join("<br>");
  return transformedLines;
};

const getYoutubeSnippet = async (url, snippetDiv) => {
  var key = showPhrase();
  var VIDEO_ID = filterVideoIdFromUrl(url);
  var version = "v3";
  var url =
    "https://www.googleapis.com/youtube/" +
    version +
    "/videos?part=snippet&id=" +
    VIDEO_ID +
    "&key=" +
    key;

  //XHR object listening for a response
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function () {
    if (this.status == 200) {
      const data = this.responseText; // server’s response data.
      const jsonData = JSON.parse(data); // parsing server response as JSON object
      const snippet = jsonData.items[0].snippet;
      snippetDiv.querySelector(".youtube-title").innerText = snippet.title;
      snippetDiv.querySelector(".youtube-published-at").innerText = new Date(
        snippet.publishedAt
      ).toUTCString();
      snippetDiv.querySelector(".youtube-description").innerHTML = transformUrl(
        snippet.description
      );
    } else {
      alert("Failed to load video data (getYoutubeSnippet).");
    }
  };

  xhr.onerror = function () {
    alert("Network Error (getYoutubeSnippet)");
  };

  xhr.send();
};

const getYoutubeThumbnail = (url, quality) => {
  if (url) {
    var video_id = filterVideoIdFromUrl(url);

    if (video_id) {
      if (typeof quality == "undefined") {
        quality = "high";
      }

      var quality_key = "maxresdefault"; // Max quality
      if (quality == "low") {
        quality_key = "sddefault";
      } else if (quality == "medium") {
        quality_key = "mqdefault";
      } else if (quality == "high") {
        quality_key = "hqdefault";
      }

      var thumbnail =
        "http://img.youtube.com/vi_webp/" +
        video_id +
        "/" +
        quality_key +
        ".webp";
      return thumbnail;
    }
  }
  return false;
};

const createEl = (tag, pa, attr) => {
  const el = document.createElement(tag);
  for (let key in attr) el.setAttribute(key, attr[key]);
  pa.appendChild(el);
  return el;
};

//const createEl = (tag, p, a) => {
//  const e = document.createElement(tag);
//  for (const key in a) e.setAttribute(key, a[key]);
//  p.appendChild(e);
//  return e;
//};

const coverDivMaker = (iframe) => {
  const coverDiv = document.createElement("div");
  const snippetDiv = document.createElement("div");
  snippetDiv.setAttribute("class", "youtube-snippet");

  //const titleDiv = document.createElement("div");
  //titleDiv.setAttribute("class", "youtube-title");
  //titleDiv.innerHTML = iframe.title;
  //snippetDiv.appendChild(titleDiv);
  createEl("div", snippetDiv, {
    class: "youtube-title",
  });

  //const publishedAtDiv = document.createElement("div");
  //publishedAtDiv.setAttribute("class", "youtube-published-at");
  //publishedAtDiv.innerHTML = "Description";
  //snippetDiv.appendChild(publishedAtDiv);
  createEl("div", snippetDiv, {
    class: "youtube-published-at",
  });

  //const descDiv = document.createElement("div");
  //descDiv.setAttribute("class", "youtube-description");
  //descDiv.innerHTML = "Description";
  //snippetDiv.appendChild(descDiv);
  createEl("div", snippetDiv, {
    class: "youtube-description",
  });
  coverDiv.appendChild(snippetDiv);

  //const img = document.createElement("img");
  //img.setAttribute("class", "youtube-thumbnail-image");
  const src = getYoutubeThumbnail(iframe.src, "low");
  //img.src = src || "data:,";
  //img.addEventListener("click", replaceImageWithIframe);
  createEl("img", coverDiv, {
    class: "youtube-thumbnail-image",
    src: src || "data:,",
  });
  //coverDiv.appendChild(img);

  //if (src) getYoutubeSnippet(iframe.src, titleDiv, publishedAtDiv, descDiv);
  if (src) getYoutubeSnippet(iframe.src, snippetDiv);

  //const playButton = document.createElement("button");
  //playButton.setAttribute("class", "youtube-play-button");
  //playButton.addEventListener("click", replaceImageWithIframe);
  //coverDiv.appendChild(playButton);
  createEl("button", coverDiv, {
    class: "youtube-play-button",
  }).addEventListener("click", replaceImageWithIframe);

  coverDiv.setAttribute("data-url", iframe.src);
  coverDiv.setAttribute("class", "youtube-thumbnail");

  return coverDiv;
};

const replaceImageWithIframe = function (e) {
  const iframe = document.createElement("iframe");
  const papa = this.parentNode;
  const grandPa = isItemState
    ? findParentTagOrClassRecursive(papa, undefined, "md-item")
    : findParentTagOrClassRecursive(papa, undefined, "file-text");
  grandPa.style.width = grandPa.offsetWidth + "px";
  grandPa.style.height = grandPa.offsetHeight + "px";
  iframe.setAttribute("src", papa.dataset.url + "?autoplay=1&rel=0");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "1");
  iframe.setAttribute("allowTranparency", "true");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  );
  iframe.setAttribute("class", "youtube-iframe");
  papa.parentNode.replaceChild(iframe, papa);
};

const waitForIframe = (resizableDiv) => {
  const iframeInitial = resizableDiv.getElementsByTagName("iframe");

  if (iframeInitial.length > 0) {
    [...iframeInitial].forEach((iframe) => {
      const papa = iframe.parentNode;
      // Insert as next sibling of <iframe>
      papa.insertBefore(coverDivMaker(iframe), iframe.nextSibling);
      papa.removeChild(iframe);
    });
  }
};
