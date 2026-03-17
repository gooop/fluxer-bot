interface DiscordMessage {
    message: string;
    authorNickname: string;
    authorUsername: string;
    timeSent: Date;
    imgLocation: string | null;
}
interface ParseOptions {
    useLocalImages?: boolean;
}

declare class DiscordMessageBuilder {
    static parseMessages(jsonString: string, options?: ParseOptions): DiscordMessage[];
    private static mapMessage;
    private static findImageLocation;
}

export { type DiscordMessage, DiscordMessageBuilder };
