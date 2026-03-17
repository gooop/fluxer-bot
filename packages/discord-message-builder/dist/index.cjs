"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DiscordMessageBuilder: () => DiscordMessageBuilder
});
module.exports = __toCommonJS(index_exports);

// src/DiscordMessageBuilder.ts
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp"]);
var DiscordMessageBuilder = class _DiscordMessageBuilder {
  static parseMessages(jsonString, options = {}) {
    const raw = JSON.parse(jsonString);
    const messages = raw.messages ?? raw.pinnedMessages ?? [];
    return messages.map((m) => _DiscordMessageBuilder.mapMessage(m, options));
  }
  static mapMessage(raw, options) {
    return {
      message: raw.content,
      authorUsername: raw.author.name,
      authorNickname: raw.author.nickname,
      timeSent: new Date(raw.timestamp),
      imgLocation: _DiscordMessageBuilder.findImageLocation(raw.id, raw.attachments, options)
    };
  }
  static findImageLocation(messageId, attachments, options) {
    const img = attachments.find((a) => {
      const ext = a.fileName.split(".").at(-1)?.toLowerCase() ?? "";
      return IMAGE_EXTENSIONS.has(ext);
    });
    if (!img) return null;
    if (options.useLocalImages) {
      const ext = img.fileName.split(".").at(-1).toLowerCase();
      return `${messageId}.${ext}`;
    }
    return img.url;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DiscordMessageBuilder
});
