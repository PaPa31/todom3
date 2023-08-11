const filterVideoIdFromUrl = (url) => {
  var video_id, result;
  if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
    video_id = result.pop();
  } else if ((result = url.match(/youtu.be\/(.{11})/))) {
    video_id = result.pop();
  }
  return video_id;
};

const getYouTubeSnippetAsync = async (
  videoId,
  version,
  titleDiv,
  publishedAtDiv,
  descriptionDiv
) => {
  var key = showPhrase();
  var url =
    "https://www.googleapis.com/youtube" +
    version +
    "/videos?" +
    "part=snippet" +
    "&id=" +
    videoId +
    "&key=";

  try {
    var response = await fetch(url);
    if (!response.ok) throw Error(response.statusText);

    var data = await response.json();
    console.log("Data:", data);

    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      item.snippet = {
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
      };
      console.log("Title: ", item.snippet.title);
      console.log("Description: ", item.snippet.description);
      console.log(
        "PublishedAt: ",
        new Date(item.snippet.publishedAt * 1000).toLocaleString()
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
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

const getYoutubeSnippet = async (
  url,
  titleDiv,
  publishedAtDiv,
  descDiv
) => {
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

  //XHR object listening for a response
  let xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);

  xhr.onload = function () {
    if (this.status == 200) {
      const data = this.responseText; // server’s response data.

      const jsonData = JSON.parse(data); // parsing server response as JSON object

      const snippet = jsonData.items[0].snippet;

      titleDiv.innerText = snippet.title;
      publishedAtDiv.innerText = new Date(snippet.publishedAt).toUTCString();

      //tripple convertation (save initial markup & linkify):
      // text > innerText > innerHTML > markdown > innerHTML
      //descDiv.innerText = snippet.description;
      //descDiv.innerHTML = markdown(descDiv.innerHTML);
      descDiv.innerHTML = transformUrl(snippet.description);
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

const waitForIframe3 = (resizableDiv) => {
  const iframeInitial = resizableDiv.getElementsByTagName("iframe");
  if (iframeInitial.length > 0) {
    [...iframeInitial].forEach((iframe) => {});
  }
};

const fn = () =>
  new Promise((resolve) => setTimeout(() => resolve(v * 2), 100));

const waitForIframe2 = async (resizableDiv) => {
  const iframeInitial = resizableDiv.getElementsByTagName("iframe");

  if (iframeInitial.length > 0) {
    [...iframeInitial].forEach((iframe) => {
      const snippetDiv = new Promise((resolve) =>
        iframeInitial.addEventListener("load", resolve)
      );
      snippetDiv.innerHTML = `
      <div class="youtube-thumbnail">
        <div class="youtube-snippet">
          <div class="youtube-title"></div>
          <div class="youtube-published-at"></div>
          <div class="youtube-description"></div>
          <img class="youtube-thumbnail-image"></img>
        </div>
        <button class="yotube-play-button"></button>
      </div>`;
      const title = iframeInitial.title;
      snippetDiv.querySelector(".youtube-title").innerText = title;
      iframeInitial.load();
    });
  }
};

const htmlStructure = (iframe) => {
  const papa = iframe.parentNode;

  const coverDiv = document.createElement("div");
  const snippetDiv = document.createElement("div");
  snippetDiv.setAttribute("class", "youtube-snippet");

  const titleDiv = document.createElement("div");
  titleDiv.setAttribute("class", "youtube-title");
  titleDiv.innerText = iframe.title;
  snippetDiv.appendChild(titleDiv);

  const publishedAtDiv = document.createElement("div");
  publishedAtDiv.setAttribute("class", "youtube-published-at");
  publishedAtDiv.innerHTML = "Description";
  snippetDiv.appendChild(publishedAtDiv);

  const descDiv = document.createElement("div");
  descDiv.setAttribute("class", "youtube-description");
  descDiv.innerHTML = "Description";
  snippetDiv.appendChild(descDiv);
  coverDiv.appendChild(snippetDiv);

  const imgTag = document.createElement("img");
  imgTag.setAttribute("class", "youtube-thumbnail-image");
  const src = getYoutubeThumbnail(iframe.src, "low");
  imgTag.src = src || "data:,";
  imgTag.addEventListener("click", replaceImageWithIframe);
  coverDiv.appendChild(imgTag);

  if (src)
    getYoutubeSnippet(iframe.src, titleDiv, publishedAtDiv, descDiv);

  const playButton = document.createElement("button");
  playButton.setAttribute("class", "youtube-play-button");
  playButton.addEventListener("click", replaceImageWithIframe);
  coverDiv.appendChild(playButton);

  coverDiv.setAttribute("data-url", iframe.src);
  coverDiv.setAttribute("class", "youtube-thumbnail");

  // Insert as next sibling of <iframe>
  papa.insertBefore(coverDiv, iframe.nextSibling);
  papa.removeChild(iframe);
  return 
};

const htmlStructure2 = function(iframe) {
const papa = iframe.parentNode;

const coverDiv = document.createElement(‘div’);
coverDiv.classList.add(‘cover-div’);

const snippetDiv = document.createElement(‘div’);
snippetDiv.classList.add(‘snippet-div’, ‘youtube-snippet’);
snippetDiv.innerHTML = <div class="youtube-title">${iframe.title}</div> <div class="published-at">Description</div>;
papa.insertBefore(snippetDiv, iframe.nextSibling);

return coverDiv;
};

const waitForIframe = (resizableDiv) => {
  const iframeInitial = resizableDiv.getElementsByTagName("iframe");

  if (iframeInitial.length > 0) {
    [...iframeInitial].forEach((iframe) => {});
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
