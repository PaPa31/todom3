const filterVideoIdFromUrl = (url) => {
  var video_id, result;
  if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
    video_id = result.pop();
  } else if ((result = url.match(/youtu.be\/(.{11})/))) {
    video_id = result.pop();
  }
  return video_id;
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const m = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  dateString = `${day} ${m[month]} ${year}`;
  return dateString;
}

const getYoutubeSnippet = (url, titleDivTag, publishedAtDivTag, descDivTag) => {
  // I created env file manually
  // 'js/ignore/env.js'
  // and added js/ignore folder to .gitignore
  //
  // Configure google API key via
  // https://console.cloud.google.com/apis/credentials?hl=ru&project=api-project-552503231252
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

  let xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);

  xhr.onload = function () {
    if (this.status == 200) {
      const data = this.responseText;
      const jsonData = JSON.parse(data);
      const snippet = jsonData.items[0].snippet;
      titleDivTag.innerText = snippet.title;
      publishedAtDivTag.innerText = formatDate(snippet.publishedAt);
      //tripple convertation (save initial markup & linkify):
      // text > innerText > innerHTML > markdown > innerHTML
      descDivTag.innerText = snippet.description;
      descDivTag.innerHTML = markdown(descDivTag.innerHTML);
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

const waitForIframe = (resizableDiv) => {
  const iframeInitial = resizableDiv.getElementsByTagName("iframe");

  if (iframeInitial.length > 0) {
    [...iframeInitial].forEach((iframe) => {
      const coverDivTag = document.createElement("div");
      const snippetDivTag = document.createElement("div");
      snippetDivTag.setAttribute("class", "youtube-snippet");
      const papa = iframe.parentElement;

      const titleDivTag = document.createElement("div");
      titleDivTag.setAttribute("class", "youtube-title");
      titleDivTag.innerText = iframe.title;
      snippetDivTag.appendChild(titleDivTag);

      const publishedAtDivTag = document.createElement("div");
      publishedAtDivTag.setAttribute("class", "youtube-published-at");
      publishedAtDivTag.innerHTML = "Description";
      snippetDivTag.appendChild(publishedAtDivTag);

      const descDivTag = document.createElement("div");
      descDivTag.setAttribute("class", "youtube-description");
      descDivTag.innerHTML = "Description";
      snippetDivTag.appendChild(descDivTag);
      coverDivTag.appendChild(snippetDivTag);

      const imgTag = document.createElement("img");
      imgTag.setAttribute("class", "youtube-thumbnail-image");
      const src = getYoutubeThumbnail(iframe.src, "low");
      imgTag.src = src || "data:,";
      imgTag.addEventListener("click", replaceImageWithIframe);
      coverDivTag.appendChild(imgTag);

      if (src)
        getYoutubeSnippet(
          iframe.src,
          titleDivTag,
          publishedAtDivTag,
          descDivTag
        );

      const playButtonTag = document.createElement("button");
      playButtonTag.setAttribute("class", "youtube-play-button");
      playButtonTag.addEventListener("click", replaceImageWithIframe);
      coverDivTag.appendChild(playButtonTag);

      coverDivTag.setAttribute("data-url", iframe.src);
      coverDivTag.setAttribute("class", "youtube-thumbnail");

      // Insert as next sibling of <iframe>
      papa.insertBefore(coverDivTag, iframe.nextSibling);
      papa.removeChild(iframe);
    });
  }
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
