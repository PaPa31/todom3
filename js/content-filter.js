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
      snipDiv.querySelector(".ytb-date").innerText = new Date(
        snip.publishedAt
      ).toUTCString();
      snipDiv.querySelector(".ytb-desc").innerHTML = transformUrl(
        snip.description
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

const getYoutubeThumbnail = (url, size = "high") => {
  try {
    var video_id = filterVideoIdFromUrl(url);
    if (video_id) {
      var size_key = "maxresdefault"; // Max size
      if (size == "low") {
        size_key = "sddefault";
      } else if (size == "medium") {
        size_key = "mqdefault";
      } else if (size == "high") {
        size_key = "hqdefault";
      }
      return (
        "https://img.youtube.com/vi_webp/" + video_id + "/" + size_key + ".webp"
      );
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

function createCoverDiv2(iframe) {
  const coverDiv = document.createElement("div");
  const snipDiv = document.createElement("div");

  const thumbnail = document.createElement("img");
  thumbnail.src = getYoutubeThumbnail(iframe.src, "low");
  thumbnail.classList.add("ytb-thumb-img");
  if (thumbnail.src) thumbnail.classList.add("loaded");
  else thumbnail.onload = () => thumbnail.classList.add("loaded");

  snipDiv.classList.add("ytb-snippet");
  snipDiv.innerHTML = `<div class="ytb-title">${getYoutubeTitle2(
    iframe.title
  )}</div>
  <div class="ytb-date">${getDate(iframe.publishedAt)}</div>`;
  coverDiv.append(thumbnail, snipDiv);
  return coverDiv;
}

function getYoutubeTitle2(title) {
  let titleText = title;
  if (!titleText) return "";
  titleText = titleText.split(" ");
  if (titleText.length > 2) titleText[2] = "...";
  return titleText.join(" ");
}

function dateStringToDate2(dateStr) {
  let dateString = getDate(dateStr);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (dateString.length === 8) {
    dateString = `${dayNames[dateString[0] - 1]} ${dateString[1]}-${
      dateString[2]
    }-${monthNames[dateString[3] - 1]}`;
  } else if (dateString.length === 6) {
    dateString =
      dayNames[dateString[4] - 1] +
      "-" +
      dateString[5] +
      "-" +
      monthNames[dateString[6] - 1];
  }
  return dateString;
}

const createEl = (tag, pa, attr) => {
  const el = document.createElement(tag);
  for (const key in attr) el.setAttribute(key, attr[key]);
  pa.appendChild(el);
  return el;
};

const coverDivMaker = (iframe) => {
  const coverDiv = document.createElement("div");
  coverDiv.setAttribute("data-url", iframe.src);
  coverDiv.setAttribute("class", "ytb-thumb");

  const snipDiv = createEl("div", coverDiv, {
    class: "ytb-snippet",
  });

  createEl("div", snipDiv, {
    class: "ytb-title",
  });

  createEl("div", snipDiv, {
    class: "ytb-date",
  });

  createEl("div", snipDiv, {
    class: "ytb-desc",
  });

  const src = getYoutubeThumbnail(iframe.src, "low");
  createEl("img", coverDiv, {
    class: "ytb-thumb-img",
    src: src || "data:,",
  });
  if (src) getYoutubeSnippet(iframe.src, snipDiv);

  createEl("button", coverDiv, {
    class: "ytb-play",
  }).addEventListener("click", replaceImageWithIframe);

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
  iframe.setAttribute("class", "ytb-iframe");
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
