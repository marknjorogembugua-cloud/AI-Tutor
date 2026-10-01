import { createElement as h } from 'react';
import { ImageResponse } from 'next/dist/compiled/@vercel/og/index.node.js';
const S = 512;
const k = S / 32; // scale factor from the 32x32 viewbox

// graduation cap built from flat divs (satori has no SVG passthrough)
function Icon({ bg = '#4f46e5', fg = '#ffffff', pad = 0 }) {
  const inner = S - pad * 2;
  const u = inner / 32; // unit inside the padded square
  return h('div', { style: { width: S, height: S, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
    h('div', { style: { position: 'relative', width: inner, height: inner } },
      // mortarboard: a wide diamond
      h('div', { style: {
        position: 'absolute', left: 7 * u, top: 7.5 * u, width: 18 * u, height: 8 * u,
        background: fg, opacity: 0.95, transform: 'rotate(0deg)',
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      } }),
      // base: U shape from a bordered box with only bottom corners rounded
      h('div', { style: {
        position: 'absolute', left: 10.5 * u, top: 13.5 * u, width: 11 * u, height: 8 * u,
        border: `${2.2 * u}px solid ${fg}`, borderTop: 'none',
        borderRadius: `0 0 ${9 * u}px ${9 * u}px`,
        boxSizing: 'border-box',
      } }),
    )
  );
}

for (const [name, size, opts] of [
  ['icon-512', 512, {}],
  ['icon-192', 192, {}],
  ['maskable-512', 512, { bg: '#4f46e5', pad: 64 }],
]) {
  const r = new ImageResponse(Icon(opts), { width: size, height: size });
  const b = Buffer.from(await r.arrayBuffer());
  const fs = await import('node:fs');
  fs.writeFileSync(`/tmp/opencode/${name}.png`, b);
  console.log(name, b.length, b.subarray(0,4).toString('hex'));
}
