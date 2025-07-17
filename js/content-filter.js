const $ = (selector = "", scope = document) => {
  const el =
    scope && scope.querySelector && selector
      ? scope.querySelector(selector)
      : null;
  if (el) {
    return el;
  } else {
    throw new Error(`Cannot find element matching selector: ${selector}`);
  }
};

const createEl = (tag, attr, pa) => {
  const el = document.createElement(tag);
  for (const key in attr) el.setAttribute(key, attr[key]);
  if (pa) pa.appendChild(el);
  return el;
};

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

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function () {
    if (this.status == 200) {
      const data = this.responseText,
        jsonData = JSON.parse(data),
        snip = jsonData.items[0].snippet;
      $(".ytb-title", snipDiv).innerText = snip.title;
      $(".ytb-date", snipDiv).innerText = dateStringToDate(snip.publishedAt);
      $(".ytb-desc", snipDiv).innerHTML = parseStrToHTML(snip.description);
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
      return "https://img.youtube.com/vi_webp/" + video_id + "/mqdefault.webp";
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

function dateStringToDate(dateStr) {
  let dateString = new Date(dateStr).toString().split(" ");
  if (dateString.length >= 8) {
    return `${dateString[2]} ${dateString[1]} ${dateString[3]}`;
  } else {
    return `${dateString[5]} ${dateString[4]} ${dateString[6]}`;
  }
}

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
  const but = createEl("button", { class: "ytb-play" }, coverDiv);
  but.addEventListener("click", replaceImageWithIframe);
  return coverDiv;
};

const replaceImageWithIframe = function (e) {
  const papa = e.target.parentNode,
    tH = papa.offsetHeight;

  const iframe = createEl("iframe", {
    class: "ytb-iframe",
    src: papa.dataset.url + "?autoplay=1&rel=0",
    style: "height:" + tH + "px",
    frameborder: "0",
    allowfullscreen: "1",
    allowTranparency: "true",
    allow:
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  });
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

// ✅ Fixed: Don't wrap markdown in <a>. Use <div> and insert <a> only in collapsed state

// ✅ Dual Viewer Toggle with simplified syntax + mobile ↗ icon support — FIXED

function toggleLoader(el, event) {
  const isCloseBtn = event.target.classList.contains('x-but');
  const isOpenRaw = event.target.classList.contains('open-raw') || event.target.classList.contains('open-ext');
  const isCollapsed = el.classList.contains('ldr-btn');
  const isOverlay = event.target === el;

  if (isOpenRaw) {
    return;
  }

  if (!isCollapsed && !isCloseBtn && !isOverlay) {
    return;
  }

  const isExpanded = el.classList.contains('ldr-con');
  if (isExpanded) {
    const label = el.dataset._originalLabel || 'Untitled';
    el.innerHTML = `
      <a href="/md.sh?${el.dataset.ldr}" target="_blank">${label}</a>
      <a class="open-ext" href="/md.sh?${el.dataset.ldr}" target="_blank" title="Open in viewer">↗</a>
    `;
    el.className = 'ldr-btn';
  } else {
    const rawLabel = el.dataset._originalLabel || el.textContent.trim();
    el.dataset._originalLabel = rawLabel;
    const src = el.dataset.ldr || el.dataset.src;

    fetch(src).then(r => {
      if (!r.ok) throw new Error('Fetch failed with status ' + r.status);
      return r.text();
    }).then(t => {
      const fullURL = '/md.sh?' + src;
      el.innerHTML = '<div class="ldr-inner">' +
        markdown(t) +
        '<div><a href="' + fullURL + '" target="_blank" class="open-raw">[⇱ open in viewer]</a></div>' +
        '</div>' +
        '<button class="bared btn x-but" title="Close"></button>';
      el.className = 'ldr-con';
    }).catch(e => {
      el.innerHTML = '<div class="ldr-inner">Error loading file.</div>';
      el.className = 'ldr-con';
    });
  }
}

function waitForLoader(resizableDiv) {
  resizableDiv.querySelectorAll('[data-ldr]').forEach(el => {
    if (el.__loaderInitialized) {
      return;
    }

    el.__loaderInitialized = true;

    const cleanLabel = el.textContent.replace(/↗/g, '').trim();
    el.dataset._originalLabel = cleanLabel;

    el.classList.add('ldr-btn');
    el.setAttribute('tabindex', '0');
    el.innerHTML = `
      <a href="/md.sh?${el.dataset.ldr}" target="_blank">${cleanLabel}</a>
      <a class="open-ext" href="/md.sh?${el.dataset.ldr}" target="_blank" title="Open in viewer">↗</a>
    `;

    el.addEventListener('click', e => {
      if (
        e.ctrlKey || e.metaKey || e.button === 1 ||
        e.target.classList.contains('open-raw') ||
        e.target.classList.contains('open-ext')
      ) {
        return;
      }
      e.preventDefault();
      toggleLoader(el, e);
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLoader(el, e);
      }
    });
  });
}
