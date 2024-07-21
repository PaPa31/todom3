//not used yet
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
