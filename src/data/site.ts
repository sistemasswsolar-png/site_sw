/* =====================================================================
   SW SOLAR | CONTEÚDO DO SITE
   Edite aqui: contatos, unidades, projetos, depoimentos e números.
   ===================================================================== */

export const CONTATO = {
  whats: '5542999998600',
  site: 'swsolar.com.br',
  insta: 'sw.solar',
  razao: 'SW Solar & Energia Ltda.',
};

export const waLink = (texto = 'Olá! Vim pelo site da SW Solar e gostaria de falar sobre um projeto.', numero = CONTATO.whats) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

export type Unidade = {
  cidade: string; uf: string; papel: 'Matriz' | 'Unidade'; end: string;
  tel: string; whats: string; foto: string; lat: number; lon: number; pos?: string;
};

export const UNIDADES: Unidade[] = [
  { cidade: 'Ponta Grossa', uf: 'PR', papel: 'Matriz', end: 'R. Ermelino de Leão, 1251', tel: '(42) 99999-8600', whats: '5542999998600', foto: 'unidades/ponta-grossa', lat: -25.095, lon: -50.162 },
  { cidade: 'Palmeira', uf: 'PR', papel: 'Unidade', end: 'R. Conceição, 963', tel: '(42) 99999-8600', whats: '5542999998600', foto: 'unidades/palmeira', lat: -25.429, lon: -50.006 },
  { cidade: 'Guarapuava', uf: 'PR', papel: 'Unidade', end: 'R. Padre Chagas, 3006', tel: '(42) 99972-3194', whats: '5542999723194', foto: 'unidades/guarapuava', lat: -25.39, lon: -51.463 },
  { cidade: 'Imbituva', uf: 'PR', papel: 'Unidade', end: 'BR 373, Km 230, Mato Branco de Baixo', tel: '(42) 99924-9490', whats: '5542999249490', foto: 'unidades/imbituva', lat: -25.23, lon: -50.604, pos: '50% 30%' },
];

/* Números da empresa (todos confirmados pela SW Solar). */
export const NUMEROS = {
  anos: 5,
  unidades: 4,
  projetos: 2000,
  modulos: 60000,
  cidades: 80,
};

export type Usina = { nome: string; cidade: string; mwp: number; tipo: string; foto?: string; obs?: string };

/* Grandes usinas (MWp). */
export const USINAS: Usina[] = [
  { nome: 'UFV Demori', cidade: 'Cruzeiro do Sul - PR', mwp: 3.407, tipo: 'Usina fotovoltaica em solo', foto: 'portfolio/demori' },
  { nome: 'UFV Baldissera', cidade: 'Cidade Gaúcha - PR', mwp: 3.36, tipo: 'Usina fotovoltaica em solo', foto: 'portfolio/baldissera' },
  { nome: 'UFV Gauna', cidade: 'Nova Esperança - PR', mwp: 1.47, tipo: 'Usina fotovoltaica em solo' },
  { nome: 'UFV Palmeira I', cidade: 'Palmeira - PR', mwp: 1.339, tipo: 'Usina fotovoltaica', obs: 'Cliente: Município de Palmeira. Empreitada global, contratação por licitação' },
];

export const totalMWp = USINAS.reduce((s, u) => s + u.mwp, 0);

export type Obra = { nome: string; local: string; kwp: number; foto: string; tipo?: string; seg: 'industria' | 'agro' | 'comercio' | 'outros' };

/* Médio porte: destaques. */
export const DESTAQUES: Obra[] = [
  { nome: 'Rendicolla', local: 'Palmeira, PR', tipo: 'Telhado industrial', kwp: 340.47, foto: 'obras/rendicolla', seg: 'industria' },
  { nome: 'Alexandre Surek', local: 'Quitandinha, PR', tipo: 'Telhado de aviários', kwp: 201.3, foto: 'obras/surek', seg: 'agro' },
  { nome: 'Fertibio', local: 'Ponta Grossa, PR', tipo: 'Telhado industrial', kwp: 177.1, foto: 'obras/fertibio', seg: 'industria' },
  { nome: 'Rodolpho Botelho', local: 'Candói, PR', tipo: 'Usina em solo, armazenagem de grãos', kwp: 155.61, foto: 'obras/botelho', seg: 'agro' },
  { nome: 'Supermercado Zaleski', local: 'Palmeira, PR', tipo: 'Telhado comercial', kwp: 120.99, foto: 'obras/zaleski', seg: 'comercio' },
];

/* Diversidade de portfólio. */
export const OBRAS: Obra[] = [
  { nome: 'Supermercado Osternack', local: 'Palmeira, PR', kwp: 95.55, foto: 'obras/osternack', seg: 'comercio' },
  { nome: 'Usina em solo Lapa', local: 'Lapa, PR', kwp: 82.82, foto: 'obras/lapa', seg: 'agro' },
  { nome: 'Cabanha Irmãos Freitas', local: 'Palmeira, PR', kwp: 80.99, foto: 'obras/cabanha', seg: 'agro' },
  { nome: 'Ítalo Barausse', local: 'Palmeira, PR', kwp: 78.25, foto: 'obras/italo', seg: 'agro' },
  { nome: 'Rede de Postos Mahle', local: 'Guairaçá, PR', kwp: 72.2, foto: 'obras/mahle', seg: 'comercio' },
  { nome: 'Bitumirim', local: 'Ivaí, PR', kwp: 69.56, foto: 'obras/bitumirim', seg: 'outros' },
  { nome: 'Viveiro Porto Amazonas', local: 'Porto Amazonas, PR', kwp: 61.64, foto: 'obras/viveiro', seg: 'agro' },
  { nome: 'Querência da Lagoa | MicroXisto', local: 'São Mateus do Sul, PR', kwp: 61.61, foto: 'obras/querencia', seg: 'outros' },
  { nome: 'Supermercado Porto', local: 'Porto Amazonas, PR', kwp: 59.59, foto: 'obras/porto', seg: 'comercio' },
  { nome: 'Moises Borkoski', local: 'Palmeira, PR', kwp: 56.05, foto: 'obras/borkoski', seg: 'outros' },
  { nome: 'Anton Egles', local: 'Guarapuava, PR', kwp: 44, foto: 'obras/anton', seg: 'outros' },
  { nome: 'Claumec', local: 'Palmeira, PR', kwp: 30.99, foto: 'obras/claumec', seg: 'industria' },
  { nome: 'Sindicato Rural', local: 'Guarapuava, PR', kwp: 18.2, foto: 'obras/sindicato', seg: 'outros' },
];

export const DEPOIMENTOS = [
  { video: 'dep-ana-maria', foto: 'depoimentos/ana-maria', nome: 'Ana Maria', sub: 'Propriedade leiteira, Prudentópolis' },
  { video: 'dep-hotel-burack', foto: 'depoimentos/hotel-burack', nome: 'Hotel Burack', sub: 'Prudentópolis, PR' },
  { video: 'dep-movebrink', foto: 'depoimentos/movebrink', nome: 'Movebrink', sub: 'Sócio-proprietário' },
  { video: 'dep-cliente-1', foto: 'depoimentos/cliente-1', nome: 'Cliente SW Solar', sub: '' },
  { video: 'dep-cliente-2', foto: 'depoimentos/cliente-2', nome: 'Cliente SW Solar', sub: '' },
  { video: 'dep-jandaia', foto: 'depoimentos/jandaia', nome: 'Usina de investimento', sub: 'Jandaia do Sul, PR' },
];

/* Tela do app de monitoramento (valores reais da usina SW Solar no app). */
export const MONITOR = {
  semana: 129.3,
  mes: 1893.4,
  ano: 18225.5,
  co2: 3.29,
  arvores: 5,
  km: 54.57,
};

export const fmt = (n: number, dec = 0) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export const decs = (n: number) => {
  const s = String(n);
  return s.includes('.') ? s.split('.')[1].length : 0;
};
