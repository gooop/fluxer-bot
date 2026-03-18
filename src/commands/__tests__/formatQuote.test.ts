import { describe, expect, it, vi } from 'vitest';

vi.mock('fs', () => ({
    readFileSync: vi.fn().mockReturnValue(Buffer.from('fake-image-data')),
}));

import { formatQuote } from '../formatQuote';

const BASE_MSG = {
    message: 'hello world',
    authorNickname: 'Nick',
    authorUsername: 'username',
    timeSent: new Date(2023, 11, 3), // December 3, 2023 (local time — avoids timezone edge cases)
    imgLocation: null as string | null,
};

describe('formatQuote', () => {
    describe('content', () => {
        it('text-only message uses "said" format', () => {
            const { content } = formatQuote({ ...BASE_MSG });
            expect(content).toBe('On December 3rd, 2023, Nick said "hello world"');
        });

        it('image-only message uses "posted this picture" format', () => {
            const { content } = formatQuote({ ...BASE_MSG, message: '', imgLocation: '123.png' });
            expect(content).toBe('On December 3rd, 2023, Nick posted this picture.');
        });

        it('link-only message uses "posted this link" format', () => {
            const { content } = formatQuote({ ...BASE_MSG, message: 'https://example.com', imgLocation: null });
            expect(content).toBe('On December 3rd, 2023, Nick posted this link https://example.com');
        });

        it('text+image falls back to "said" format', () => {
            const { content } = formatQuote({ ...BASE_MSG, message: 'check this out', imgLocation: '123.png' });
            expect(content).toBe('On December 3rd, 2023, Nick said "check this out"');
        });

        it('falls back to username when nickname is empty', () => {
            const { content } = formatQuote({ ...BASE_MSG, authorNickname: '' });
            expect(content).toBe('On December 3rd, 2023, username said "hello world"');
        });
    });

    describe('ordinal date suffixes', () => {
        it.each([
            [1, 'st'], [2, 'nd'], [3, 'rd'], [4, 'th'],
            [11, 'th'], [12, 'th'], [13, 'th'],
            [21, 'st'], [22, 'nd'], [23, 'rd'], [31, 'st'],
        ])('day %i uses suffix %s', (day, suffix) => {
            const { content } = formatQuote({ ...BASE_MSG, timeSent: new Date(2023, 0, day) }); // January
            expect(content).toContain(`January ${day}${suffix}, 2023`);
        });
    });

    describe('imageAttachment', () => {
        it('is null when imgLocation is null', () => {
            const { imageAttachment } = formatQuote({ ...BASE_MSG, imgLocation: null });
            expect(imageAttachment).toBeNull();
        });

        it('is populated when imgLocation is set', () => {
            const { imageAttachment } = formatQuote({ ...BASE_MSG, imgLocation: '1234.png' });
            expect(imageAttachment).toEqual({
                files: [{ name: '1234.png', data: Buffer.from('fake-image-data') }],
                attachments: [{ id: '0', filename: '1234.png' }],
            });
        });
    });
});
