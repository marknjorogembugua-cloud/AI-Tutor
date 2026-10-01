import { ImageResponse } from 'next/og';

/**
 * Social card for every route that doesn't override it.
 *
 * Without this, a shared link renders as a bare text card with no preview
 * image, which is the single most visible "this is a prototype" signal on a
 * product people are meant to share with teachers and other parents.
 *
 * The card is built from flexbox divs rather than SVG because satori — the
 * renderer behind next/og — has no SVG passthrough. The graduation cap is
 * therefore redrawn with a clipped diamond and a bordered box, matching
 * app/icon.svg and the PNGs from scripts/generate-icons.mjs.
 */

export const alt = 'AI Personal Tutor — a tutor that finds the misconception, not just the wrong answer.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRAND = '#4f46e5';
const BRAND_DEEP = '#3a34c4';
const INK = '#111430';
const SLATE = '#4a5070';

/** The graduation-cap mark, at `size` px square. */
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
                {/* Mortarboard */}
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
                {/* Cap body and bowl */}
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

export default function OpengraphImage() {
    const stats = [
        { value: '2,324', label: 'skills to practise' },
        { value: '62', label: 'subjects' },
        { value: '11', label: 'languages' },
    ];

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: `linear-gradient(135deg, #ffffff 0%, #f6f7ff 55%, #eef0ff 100%)`,
                    padding: 80,
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Accent bar echoes the page's brand rule */}
                <div style={{ display: 'flex', width: 96, height: 8, borderRadius: 4, background: BRAND }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Cap size={104} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: 30, fontWeight: 700, color: BRAND_DEEP, letterSpacing: 2 }}>
                                AI PERSONAL TUTOR
                            </div>
                            <div style={{ fontSize: 22, color: SLATE, marginTop: 6 }}>
                                Maths, sciences, languages and exam prep
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            fontSize: 62,
                            fontWeight: 700,
                            color: INK,
                            lineHeight: 1.12,
                            letterSpacing: -1.5,
                            maxWidth: 980,
                        }}
                    >
                        A tutor that finds the misconception, not just the wrong answer.
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: '#ffffff',
                                    border: '2px solid #e3e6f7',
                                    borderRadius: 18,
                                    padding: '18px 26px',
                                }}
                            >
                                <div style={{ fontSize: 38, fontWeight: 700, color: BRAND_DEEP }}>{s.value}</div>
                                <div style={{ fontSize: 20, color: SLATE, marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: BRAND,
                            color: '#ffffff',
                            borderRadius: 999,
                            padding: '16px 28px',
                            fontSize: 24,
                            fontWeight: 600,
                        }}
                    >
                        Free to start
                    </div>
                </div>
            </div>
        ),
        size
    );
}