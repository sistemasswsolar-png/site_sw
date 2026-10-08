import type { ImageMetadata } from 'astro';

const todas = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/**/*.{jpg,png}', { eager: true });

/** img('obras/rendicolla') → metadados da imagem em src/assets/img */
export function img(nome: string): ImageMetadata {
  const k = Object.keys(todas).find((p) => p.replace(/\.(jpg|png)$/, '').endsWith('/img/' + nome));
  if (!k) throw new Error(`Imagem não encontrada: ${nome}`);
  return todas[k].default;
}
