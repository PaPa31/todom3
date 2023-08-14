const createEl = (tag, attr, pa) => {
    const el = document.createElement(tag);
    for (const key in attr) el.setAttribute(key, attr[key]);
    if (pa) pa.appendChild(el);
    return el;
  };