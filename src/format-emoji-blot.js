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
    if (value && typeof value === 'object' && typeof value.unicode === 'string') {
      return value;
    }

    const name = typeof value === 'string' ? value : value && value.name;
    const emoji = typeof name === 'string' ? emojiMap[name] : undefined;

    return emoji && typeof emoji.unicode === 'string' ? emoji : undefined;
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