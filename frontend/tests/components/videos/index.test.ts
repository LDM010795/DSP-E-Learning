/**
 * videos/index exports — smoke test
 *
 * Ensures the central barrel file re-exports the expected public API:
 * - VideoPlayer
 * - YouTubePlayer
 * - WasabiPlayer
 *
 * Author: DSP development team
 * Date: 2025-09-29
 */

import * as Videos from '../../../src/components/videos';

describe('videos index exports', () => {
    test('exposes expected components', () => {
        expect(Videos).toHaveProperty('VideoPlayer');
        expect(Videos).toHaveProperty('YouTubePlayer');
        expect(Videos).toHaveProperty('WasabiPlayer');

        // Basic sanity: exported values are functions (React components)
        expect(typeof Videos.VideoPlayer).toBe('function');
        expect(typeof Videos.YouTubePlayer).toBe('function');
        expect(typeof Videos.WasabiPlayer).toBe('function');
    });
});
