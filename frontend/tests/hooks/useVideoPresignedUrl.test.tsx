/**
 *  useVideoPresignedUrl:
 *   Validates the 3 hooks that fetch presigned URLs:
 *     - usePresignedById
 *     - usePresignedByKey
 *     - useStoragePresignedByKey
 *
 *  Mock AuthContext (simulate logged-in / logged-out user)
 *  Mock API calls with vi.fn() (videoApi + presignApi)
 *  Wrap hooks with QueryClientProvider (React Query context)
 *  Probe components render query state (status, fetchStatus, data, error)
 *
 * RETRY HANDLING
 *   Hooks set `retry: 1`, so error-path tests need to:
 *     1) Mock API with bad payload twice ({} + {})
 *     2) Advance fake timers (`vi.advanceTimersByTimeAsync(2500)`)
 *     3) Switch back to real timers, then assert status === "error"
 *
 * TESTS
 *   • Disabled → no fetch when no user/id/key
 *   • Success  → returns presigned URL
 *   • Error    → missing presigned_url → status "error" + error message
 *
 * Author: DSP Development Team
 * Date: 2025-01-02
 */


type PresignResponse = { presigned_url?: string };

// ---- Auth mock (mutable per test) ----
const authState: { user: { id: number } | null; isAuthenticated: boolean } = {
    user: { id: 1 },
    isAuthenticated: true,
};

vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => authState,
}));

// ---- API spies with proper typing ----
const getById = vi.fn<(id: number) => Promise<PresignResponse>>();
const getByKey = vi.fn<(key: string) => Promise<PresignResponse>>();
const getStorageByKey = vi.fn<(key: string) => Promise<PresignResponse>>();

vi.mock('../../src/util/apis/videoApi', () => ({
    getPresignedUrlById: (id: number) => getById(id),
    getPresignedUrlByKey: (key: string) => getByKey(key),
}));

vi.mock('../../src/util/apis/presignApi', () => ({
    getPresignedByKey: (key: string) => getStorageByKey(key),
}));

// ---- Imports AFTER mocks ----
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import {
  usePresignedById,
  usePresignedByKey,
  useStoragePresignedByKey,
} from '../../src/hooks/useVideoPresignedUrl';

// ---- Helpers ----
function createClient() {
    return new QueryClient({ defaultOptions: { queries: {} } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
    const qc = React.useMemo(createClient, []);
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function IdProbe({ id }: { id?: number }) {
    const { data, error, fetchStatus, status } = usePresignedById(id);
    return (
        <div>
            <div data-testid="status">{status}</div>
            <div data-testid="fetchStatus">{fetchStatus}</div>
            <div data-testid="data">{data ?? ''}</div>
            <div data-testid="err">{error ? String(error) : ''}</div>
        </div>
    );
}

function KeyProbe({ k }: { k?: string }) {
    const { data, error, fetchStatus, status } = usePresignedByKey(k);
    return (
        <div>
            <div data-testid="status">{status}</div>
            <div data-testid="fetchStatus">{fetchStatus}</div>
            <div data-testid="data">{data ?? ''}</div>
            <div data-testid="err">{error ? String(error) : ''}</div>
        </div>
    );
}

function StorageProbe({ k }: { k?: string }) {
    const { data, error, fetchStatus, status } = useStoragePresignedByKey(k);
    return (
        <div>
            <div data-testid="status">{status}</div>
            <div data-testid="fetchStatus">{fetchStatus}</div>
            <div data-testid="data">{data ?? ''}</div>
            <div data-testid="err">{error ? String(error) : ''}</div>
        </div>
    );
}

// Flush React Query’s retry (default ~1000ms) and microtasks.
async function flushReactQueryRetry(totalMs = 2500) {
    await vi.advanceTimersByTimeAsync(totalMs);
    await Promise.resolve(); // flush microtasks
    }

describe('useVideoPresignedUrl hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        authState.user = { id: 1 };
        authState.isAuthenticated = true;
    });

    describe('usePresignedById', () => {
        test('disabled when no id or no user (no fetch)', () => {
            authState.user = null as any;

            render(
                <Wrapper>
                    <IdProbe id={undefined} />
                </Wrapper>
            );

            expect(getById).not.toHaveBeenCalled();
            expect(screen.getByTestId('fetchStatus').textContent).toBe('idle');
        });

        test('success path returns presigned url', async () => {
            getById.mockResolvedValueOnce({ presigned_url: 'https://signed/video.mp4' });

            render(
                <Wrapper>
                    <IdProbe id={42} />
                </Wrapper>
            );

            await waitFor(() =>
                expect(screen.getByTestId('data').textContent).toBe('https://signed/video.mp4')
            );
            expect(getById).toHaveBeenCalledWith(42);
        });

        test('error when API response lacks presigned_url', async () => {
            // return bad payload twice to satisfy retry: 1
            getById.mockResolvedValueOnce({}).mockResolvedValueOnce({});

            vi.useFakeTimers();
            render(
                <Wrapper>
                    <IdProbe id={7} />
                </Wrapper>
            );

            await flushReactQueryRetry(); // cover retry delay(s)
            vi.useRealTimers();

            await waitFor(() =>
                expect(screen.getByTestId('status').textContent).toBe('error')
            );
            expect(screen.getByTestId('err').textContent).toMatch(/Keine presigned URL/i);
        });
    });

    describe('usePresignedByKey', () => {
        test('disabled when no key or no user', () => {
            authState.user = null as any;

            render(
                <Wrapper>
                    <KeyProbe k={undefined} />
                </Wrapper>
            );

            expect(getByKey).not.toHaveBeenCalled();
            expect(screen.getByTestId('fetchStatus').textContent).toBe('idle');
        });

        test('success path returns presigned url', async () => {
            getByKey.mockResolvedValueOnce({ presigned_url: 'https://signed/bykey.mp4' });

            render(
                <Wrapper>
                    <KeyProbe k={'foo/bar.mp4'} />
                </Wrapper>
            );

            await waitFor(() =>
                expect(screen.getByTestId('data').textContent).toBe('https://signed/bykey.mp4')
            );
            expect(getByKey).toHaveBeenCalledWith('foo/bar.mp4');
        });

        test('error when API response lacks presigned_url', async () => {
            getByKey.mockResolvedValueOnce({}).mockResolvedValueOnce({});

            vi.useFakeTimers();
            render(
                <Wrapper>
                    <KeyProbe k={'missing.mp4'} />
                </Wrapper>
            );

            await flushReactQueryRetry();
            vi.useRealTimers();

            await waitFor(() =>
                expect(screen.getByTestId('status').textContent).toBe('error')
            );
            expect(screen.getByTestId('err').textContent).toMatch(/Keine presigned URL/i);
        });
    });

    describe('useStoragePresignedByKey', () => {
        test('disabled when no key or no user', () => {
            authState.user = null as any;

            render(
                <Wrapper>
                    <StorageProbe k={undefined} />
                </Wrapper>
            );

            expect(getStorageByKey).not.toHaveBeenCalled();
            expect(screen.getByTestId('fetchStatus').textContent).toBe('idle');
        });

        test('success path returns presigned url', async () => {
            getStorageByKey.mockResolvedValueOnce({ presigned_url: 'https://signed/img.png' });

            render(
                <Wrapper>
                    <StorageProbe k={'images/logo.png'} />
                </Wrapper>
            );

            await waitFor(() =>
                expect(screen.getByTestId('data').textContent).toBe('https://signed/img.png')
            );
            expect(getStorageByKey).toHaveBeenCalledWith('images/logo.png');
        });

        test('error when API response lacks presigned_url', async () => {
            getStorageByKey.mockResolvedValueOnce({}).mockResolvedValueOnce({});

            vi.useFakeTimers();
            render(
                <Wrapper>
                    <StorageProbe k={'images/missing.png'} />
                </Wrapper>
            );

            await flushReactQueryRetry();
            vi.useRealTimers();

            await waitFor(() =>
                expect(screen.getByTestId('status').textContent).toBe('error')
            );
            expect(screen.getByTestId('err').textContent).toMatch(/Keine presigned URL/i);
        });
    });
});
