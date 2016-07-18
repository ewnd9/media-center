function translate(el) {
  const name = el.name || 'text';

  return {
    name,
    isBlockElement: isBlockElement(name),
    text: el.data,
    attribs: el.attribs,
    children: el.children && el.children.filter && el.children.filter(child => child.type !== 'text' || child.data.trim()).map(child => translate(child)) || undefined
  };
}

export default translate;

// https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
const blockElements = [
  'address',
  'article',
  'aside',
  'blockquote',
  'body',
  'canvas',
  'dd',
  'div',
  'dl',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hgroup',
  'hr',
  'li',
  'main',
  'nav',
  'noscript',
  'ol',
  'output',
  'p',
  'pre',
  'section',
  'table',
  'tfoot',
  'ul',
  'video'
];

const isBlockElement = tagName => blockElements.indexOf(tagName) > -1;
