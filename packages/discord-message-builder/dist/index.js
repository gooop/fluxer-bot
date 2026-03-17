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
  static findImageLocation(_messageId, attachments, options) {
    const img = attachments.find((a) => {
      const ext = a.fileName.split(".").at(-1)?.toLowerCase() ?? "";
      return IMAGE_EXTENSIONS.has(ext);
    });
    if (!img) return null;
    if (options.useLocalImages) {
      const ext = img.fileName.split(".").at(-1).toLowerCase();
      return `${img.id}.${ext}`;
    }
    return img.url;
  }
};
export {
  DiscordMessageBuilder
};
