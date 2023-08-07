const filterVideoIdFromUrl = (url) => {
  var video_id, result;
  if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
    video_id = result.pop();
  } else if ((result = url.match(/youtu.be\/(.{11})/))) {
    video_id = result.pop();
  }
  return video_id;
};

const getYoutubeTitle = (url, titleDivTag, descDivTag) => {
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
      let data = this.responseText;
      let jsonData = JSON.parse(data);
      let title = jsonData.items[0].snippet.title;
      let description = jsonData.items[0].snippet.description;
      titleDivTag.innerText = title;
      descDivTag.innerText = description;
      descDivTag.innerHTML = markdown(descDivTag.innerHTML);
    } else {
      alert("Failed to load video data (getYoutubeTitle).");
    }
  };

  xhr.onerror = function () {
    alert("Network Error (getYoutubeTitle)");
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
      const divTag = document.createElement("div");
      const papa = iframe.parentElement;

      const titleDivTag = document.createElement("div");
      titleDivTag.setAttribute("class", "youtube-title");
      titleDivTag.innerText = iframe.title;
      divTag.appendChild(titleDivTag);

      const descDivTag = document.createElement("div");
      descDivTag.setAttribute("class", "youtube-description");
      descDivTag.innerHTML = "Description";
      divTag.appendChild(descDivTag);

      getYoutubeTitle(iframe.src, titleDivTag, descDivTag);

      const imgTag = document.createElement("img");
      imgTag.setAttribute("class", "youtube-thumbnail-image");
      imgTag.setAttribute("src", getYoutubeThumbnail(iframe.src, "low"));
      imgTag.addEventListener("click", replaceImageWithIframe);
      divTag.appendChild(imgTag);

      const playButtonTag = document.createElement("button");
      playButtonTag.setAttribute("class", "youtube-play-button");
      playButtonTag.addEventListener("click", replaceImageWithIframe);
      divTag.appendChild(playButtonTag);

      divTag.setAttribute("data-url", iframe.src);
      divTag.setAttribute("class", "youtube-thumbnail");

      // Insert as next sibling of <iframe>
      papa.insertBefore(divTag, iframe.nextSibling);
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
