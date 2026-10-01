import { ImageResponse } from 'next/og';

/**
 * Twitter/X card.
 *
 * Next.js will reuse the OpenGraph image for Twitter when only
 * opengraph-image is defined, but X's card crops favour a taller composition,
 * so this variant drops the stat row and centres the message instead.
 */

export const alt = 'AI Personal Tutor — practice that adapts to how a learner actually thinks.';
export const size = { width: 1200, height: 600 };
export const contentType = 'image/png';

const BRAND = '#4f46e5';
const INK = '#111430';
const SLATE = '#4a5070';

function Cap({ size }: { size: number }) {
    const u = size / 32;
    return (
        <div
            style={{
                width: size,
                height: size,
                background: BRAND,
                borderRadius: size * 0.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ position: 'relative', width: size, height: size, display: 'flex' }}>
                <div
                    style={{
                        position: 'absolute',
                        left: 7 * u,
                        top: 7.5 * u,
                        width: 18 * u,
                        height: 8 * u,
                        background: '#ffffff',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        left: 10.5 * u,
                        top: 13.5 * u,
                        width: 11 * u,
                        height: 8.1 * u,
                        border: `${2.2 * u}px solid #ffffff`,
                        borderTop: 'none',
                        borderRadius: `0 0 ${9 * u}px ${9 * u}px`,
                    }}
                />
            </div>
        </div>
    );
}

export default function TwitterImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 36,
                    background: `linear-gradient(135deg, #ffffff 0%, #f6f7ff 55%, #eef0ff 100%)`,
                    padding: 70,
                    fontFamily: 'sans-serif',
                }}
            >
                <Cap size={120} />
                <div
                    style={{
                        display: 'flex',
                        fontSize: 56,
                        fontWeight: 700,
                        color: INK,
                        textAlign: 'center',
                        lineHeight: 1.14,
                        letterSpacing: -1.2,
                        maxWidth: 960,
                    }}
                >
                    A tutor that finds the misconception, not just the wrong answer.
                </div>
                <div style={{ display: 'flex', fontSize: 26, color: SLATE }}>
                    62 subjects · 2,324 skills · 11 languages
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: BRAND,
                        color: '#ffffff',
                        borderRadius: 999,
                        padding: '16px 30px',
                        fontSize: 24,
                        fontWeight: 600,
                    }}
                >
                    Free to start
                </div>
            </div>
        ),
        size
    );
}