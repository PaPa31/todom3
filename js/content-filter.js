const filterVideoIdFromUrl = (url) => {
  var video_id, result;
  if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
    video_id = result.pop();
  } else if ((result = url.match(/youtu.be\/(.{11})/))) {
    video_id = result.pop();
  }
  return video_id;
};

const parseStrToHTML = (jsonStr) => {
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

const getYoutubeSnippet = async (url, snipDiv) => {
  var key = showPhrase();
  var VIDEO_ID = filterVideoIdFromUrl(url);
  var url =
    "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
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
      const snip = jsonData.items[0].snippet;
      snipDiv.querySelector(".ytb-title").innerText = snip.title;
      snipDiv.querySelector(".ytb-date").innerText = dateStringToDate(
        snip.publishedAt
      );
      snipDiv.querySelector(".ytb-desc").innerHTML = parseStrToHTML(
        snip.description
      );
      snipDiv.classList.add("ytb-loaded");
    } else {
      alert("Failed to load video data (getYoutubeSnippet).");
    }
  };
  xhr.onerror = function () {
    alert("Network Error (getYoutubeSnippet)");
  };
  xhr.send();
};

const getYoutubeThumbnail = (url) => {
  try {
    const video_id = filterVideoIdFromUrl(url);
    if (video_id) {
      return "https://img.youtube.com/vi_webp/" + video_id + "/sddefault.webp";
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

function dateStringToDate(dateStr) {
  let dateString = new Date(dateStr).toString().split(" ");
  if (dateString.length === 8) {
    return `${dateString[2]} ${dateString[1]} ${dateString[3]}`;
  } else if (dateString.length === 6) {
    return `${dateString[5]} ${dateString[4]} ${dateString[6]}`;
  }
}

const createEl = (tag, attr, pa) => {
  const el = document.createElement(tag);
  for (const key in attr) el.setAttribute(key, attr[key]);
  if (pa) pa.appendChild(el);
  return el;
};

const coverDivMaker = (iframe) => {
  const coverDiv = createEl("div", {
      "data-url": iframe.src,
      class: "ytb-thumb",
    }),
    snipDiv = createEl("div", { class: "ytb-snip" }, coverDiv),
    src = getYoutubeThumbnail(iframe.src);
  createEl("div", { class: "ytb-title" }, snipDiv);
  createEl("div", { class: "ytb-date" }, snipDiv);
  createEl("div", { class: "ytb-desc" }, snipDiv);
  createEl("img", { class: "ytb-img", src: src || "data:," }, coverDiv);
  if (src) getYoutubeSnippet(iframe.src, snipDiv);
  createEl("button", { class: "ytb-play" }, coverDiv).addEventListener(
    "click",
    replaceImageWithIframe
  );
  return coverDiv;
};

const replaceImageWithIframe = function (e) {
  const papa = e.target.parentNode,
    grandPa = isItemState
      ? findParentTagOrClassRecursive(papa, undefined, "md-item")
      : findParentTagOrClassRecursive(papa, undefined, "file-text"),
    iframe = createEl("iframe", {
      class: "ytb-iframe",
      src: papa.dataset.url + "?autoplay=1&rel=0",
      frameborder: "0",
      allowfullscreen: "1",
      allowTranparency: "true",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    });
  papa.parentNode.replaceChild(iframe, papa);
  grandPa.style.width = grandPa.offsetWidth + "px";
  grandPa.style.height = grandPa.offsetHeight + "px";
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
