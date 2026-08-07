import Quill from 'quill';
import emojiMap from "./emoji-map";

const Embed = Quill.import('blots/embed');

class EmojiBlot extends Embed {
  static create(value) {
    let node = super.create();
    const emoji = EmojiBlot.resolveEmoji(value);

    if (emoji) {
      EmojiBlot.buildSpan(emoji, node);
    }

    return node;
  }

  static value(node) {
    return node.dataset.name;
  }

  // A value arrives either as an emoji name or as an emoji object, and since
  // value() reads it back as a name, a stored object may have lost its
  // unicode; look those up by name. Values that resolve to no emoji build an
  // empty blot, because throwing here escapes calls like setContents() and
  // takes down whatever renders the editor.
  static resolveEmoji(value) {
    if (EmojiBlot.isRenderable(value)) {
      return value;
    }

    const name = typeof value === 'string' ? value : value && value.name;
    const emoji = typeof name === 'string' ? emojiMap[name] : undefined;

    return EmojiBlot.isRenderable(emoji) ? emoji : undefined;
  }

  static isRenderable(emoji) {
    if (!emoji || typeof emoji !== 'object' || typeof emoji.unicode !== 'string') {
      return false;
    }

    // buildSpan hands these to String.fromCodePoint, which throws a RangeError
    // on anything that is not a code point.
    return EmojiBlot.parseUnicode(emoji.unicode).every(
      codePoint => Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
    );
  }

  static buildSpan(value, node) {
    node.setAttribute('data-name', value.name);
    let emojiSpan = document.createElement('span');
    emojiSpan.classList.add(this.emojiClass);
    emojiSpan.classList.add(this.emojiPrefix + value.name);
    // unicode can be '1f1f5-1f1ea',see emoji-list.js.
    emojiSpan.innerText = String.fromCodePoint(...EmojiBlot.parseUnicode(value.unicode));
    node.appendChild(emojiSpan);
  }
  static parseUnicode(string) {
    return string.split('-').map(str => parseInt(str, 16));
  }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.className = 'ql-emojiblot';
EmojiBlot.tagName = 'span';
EmojiBlot.emojiClass = 'ap';
EmojiBlot.emojiPrefix = 'ap-';

export default EmojiBlot;