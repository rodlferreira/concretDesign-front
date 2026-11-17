import QRCode from 'qrcode';
import { readFile, writeFile } from 'node:fs/promises';
const url = 'https://wa.me/351963445555';
const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
const n = qr.modules.size;
const cell = 12, quiet = 4, offset = 22;
const size = (n + quiet * 2) * cell + offset * 2;
const start = offset + quiet * cell;
const logoCells = 7;
const logoStart = (n - logoCells) / 2;
let path = '';
for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) {
  if (row >= logoStart && row < logoStart + logoCells && col >= logoStart && col < logoStart + logoCells) continue;
  if (qr.modules.get(row, col)) path += `M${start+col*cell} ${start+row*cell}h${cell}v${cell}h-${cell}z`;
}
const symbol = await readFile(new URL('../public/images/brand-symbol.svg', import.meta.url),'utf8');
const logo = Buffer.from(symbol).toString('base64');
const center = start + logoStart * cell;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size+82}" viewBox="0 0 ${size} ${size+82}" role="img" aria-labelledby="title desc">
<title id="title">ConcretDesign — WhatsApp da Emilly</title><desc id="desc">QR code para ${url}</desc>
<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5bf86"/><stop offset=".45" stop-color="#e6aa70"/><stop offset=".65" stop-color="#d8d3cb"/><stop offset="1" stop-color="#c2bdb5"/></linearGradient></defs>
<rect width="100%" height="100%" rx="26" fill="#171716"/>
<rect x="8" y="8" width="${size-16}" height="${size+66}" rx="22" fill="none" stroke="url(#metal)" stroke-width="3"/>
<path d="${path}" fill="url(#metal)"/>
<rect x="${center}" y="${center}" width="${logoCells*cell}" height="${logoCells*cell}" rx="5" fill="#171716"/>
<image x="${center+8}" y="${center+9}" width="${logoCells*cell-16}" height="${logoCells*cell-18}" xlink:href="data:image/svg+xml;base64,${logo}"/>
<text x="${size/2}" y="${size+9}" text-anchor="middle" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="#ece9e3">CONCRET<tspan fill="#e6aa70">DESIGN</tspan></text>
<text x="${size/2}" y="${size+33}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" letter-spacing="3" fill="#d8d3cb">REVESTIMENTOS DECORATIVOS</text>
<text x="${size/2}" y="${size+58}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#e6aa70">WhatsApp · Emilly Prado</text>
</svg>`;
await writeFile(new URL('../public/images/whatsapp-emilly-qr.svg',import.meta.url),svg);
console.log(`Generated ${n} × ${n} QR: ${url}`);
