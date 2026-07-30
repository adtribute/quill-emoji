import Quill from "quill";
import emojiMap from "./emoji-map";

const Embed = Quill.import("blots/embed");

class EmojiBlot extends Embed {
  static create(value) {
    let node = super.create();
    if (value && typeof value === "object") {
      EmojiBlot.buildSpan(value, node);
    } else if (typeof value === "string") {
      const valueObj = emojiMap[value];

      if (valueObj) {
        EmojiBlot.buildSpan(valueObj, node);
      }
    }

    return node;
  }

  static value(node) {
    const name = node.dataset.name;
    const imageUrl = node.dataset.imageUrl;
    const unicode = node.dataset.unicode;

    if (imageUrl) {
      return {
        name,
        imageUrl,
        isAnimated: node.dataset.isAnimated === "true",
      };
    }
    if (unicode) {
      return { name, unicode };
    }
    return name;
  }

  static buildSpan(value, node) {
    node.setAttribute("data-name", value.name);
    if (value.name) node.setAttribute("title", `:${value.name}:`);
    let emojiSpan = document.createElement("span");
    emojiSpan.classList.add(this.emojiClass);
    emojiSpan.classList.add(this.emojiPrefix + value.name);

    if (value.imageUrl) {
      node.setAttribute("data-image-url", value.imageUrl);
      if (value.isAnimated)
        node.setAttribute("data-is-animated", value.isAnimated);
      let image = document.createElement("img");
      image.src = value.imageUrl;
      image.alt = `:${value.name}:`; // :emoji-name: rather than emoji-name
      image.draggable = false;

      emojiSpan.classList.add(this.imageClass);
      if (value.isAnimated) emojiSpan.classList.add(this.animatedClass);
      emojiSpan.appendChild(image);
    } else if (typeof value.unicode === "string") {
      // unicode can be '1f1f5-1f1ea',see emoji-list.js.
      node.setAttribute("data-unicode", value.unicode);
      emojiSpan.innerText = String.fromCodePoint(
        ...EmojiBlot.parseUnicode(value.unicode),
      );
    } else {
      // unknown value shape (e.g. data written by a newer or older client);
      // degrade to the raw shortcode text instead of throwing
      emojiSpan.innerText = value.name ? `:${value.name}:` : "";
    }

    node.appendChild(emojiSpan);
  }

  static parseUnicode(string) {
    return string.split("-").map((str) => parseInt(str, 16));
  }
}

EmojiBlot.blotName = "emoji";
EmojiBlot.className = "ql-emojiblot";
EmojiBlot.tagName = "span";
EmojiBlot.emojiClass = "ap";
EmojiBlot.emojiPrefix = "ap-";
EmojiBlot.imageClass = "qe-image";
EmojiBlot.animatedClass = "qe-image-animated";

export default EmojiBlot;
