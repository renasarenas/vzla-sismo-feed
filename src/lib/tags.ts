// Single source of truth for tag → color/label data. Previously this map was
// duplicated across CardImage.tsx (dot colors + short names), stats/page.tsx
// (hex values + full labels) and FeedNoticias.tsx (border/text colors + short
// names) — all agreeing on the same hex values, so they're consolidated here.
// SideRails.tsx uses an intentionally different muted palette (see
// TAG_MUTED_PILL below) that is NOT part of this canonical set.

export type TagKey =
  | 'todos'
  | 'sismo'
  | 'rescate'
  | 'desaparecidos'
  | 'puntos_acopio'
  | 'ayuda_humanitaria'
  | 'replicas'
  | 'donaciones'
  | 'internacional'

export type TagInfo = {
  /** Raw hex value, used for charts (stats donut/table) that need a CSS color, not a class. */
  hex: string
  /** Dot color utility classes (light + dark). */
  dotColor: string
  /** Short label used in pills/filters (e.g. TagPill, FeedNoticias filter bar). */
  short: string
  /** Full label used in stats and dropdowns. */
  label: string
  /** Left-border utility class used by FeedNoticias' filter/category styling. */
  border: string
  /** Text color utility classes (light + dark), used by FeedNoticias' active filter state. */
  text: string
}

export const TAGS: Record<TagKey, TagInfo> = {
  todos: {
    hex: '#444444',
    dotColor: 'bg-ink-muted',
    short: 'Todas',
    label: 'Todas las categorías',
    border: 'border-l-[#444]',
    text: 'text-ink-muted dark:text-ink-muted-dark',
  },
  sismo: {
    hex: '#CF1020',
    dotColor: 'bg-[#CF1020] dark:bg-[#EF4444]',
    short: 'Sismo',
    label: 'Sismo',
    border: 'border-l-[#CF1020]',
    text: 'text-[#CF1020] dark:text-[#EF4444]',
  },
  rescate: {
    hex: '#F97316',
    dotColor: 'bg-[#F97316] dark:bg-[#FB923C]',
    short: 'Rescate',
    label: 'Rescate',
    border: 'border-l-[#F97316]',
    text: 'text-[#F97316] dark:text-[#FB923C]',
  },
  desaparecidos: {
    hex: '#A855F7',
    dotColor: 'bg-[#A855F7] dark:bg-[#C084FC]',
    short: 'Desap.',
    label: 'Desaparecidos',
    border: 'border-l-[#A855F7]',
    text: 'text-[#A855F7] dark:text-[#C084FC]',
  },
  puntos_acopio: {
    hex: '#22C55E',
    dotColor: 'bg-[#22C55E] dark:bg-[#4ADE80]',
    short: 'Acopio',
    label: 'Puntos de acopio',
    border: 'border-l-[#22C55E]',
    text: 'text-[#22C55E] dark:text-[#4ADE80]',
  },
  ayuda_humanitaria: {
    hex: '#3B82F6',
    dotColor: 'bg-[#3B82F6] dark:bg-[#60A5FA]',
    short: 'Ayuda',
    label: 'Ayuda humanitaria',
    border: 'border-l-[#3B82F6]',
    text: 'text-[#3B82F6] dark:text-[#60A5FA]',
  },
  replicas: {
    hex: '#EAB308',
    dotColor: 'bg-[#EAB308] dark:bg-[#FACC15]',
    short: 'Réplicas',
    label: 'Réplicas',
    border: 'border-l-[#EAB308]',
    text: 'text-[#EAB308] dark:text-[#FACC15]',
  },
  donaciones: {
    hex: '#14B8A6',
    dotColor: 'bg-[#14B8A6] dark:bg-[#2DD4BF]',
    short: 'Donar',
    label: 'Donaciones',
    border: 'border-l-[#14B8A6]',
    text: 'text-[#14B8A6] dark:text-[#2DD4BF]',
  },
  internacional: {
    hex: '#94A3B8',
    dotColor: 'bg-[#94A3B8] dark:bg-[#CBD5E1]',
    short: 'Int.',
    label: 'Internacional',
    border: 'border-l-[#94A3B8]',
    text: 'text-[#94A3B8] dark:text-[#CBD5E1]',
  },
}

/** Dot color utility classes per tag, falling back to the muted default for unknown tags. */
export function getDotColorClass(tag: string): string {
  return TAGS[tag as TagKey]?.dotColor ?? 'bg-ink-muted'
}

/** Short names, e.g. for TagPill / FeedNoticias filter bar. */
export const TAG_SHORT_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(TAGS).map(([tag, { short }]) => [tag, short])
)

/** Raw hex values, for contexts that need a CSS color rather than a class (stats charts). */
export const TAG_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(TAGS).filter(([tag]) => tag !== 'todos').map(([tag, { hex }]) => [tag, hex])
)

/** Full labels, e.g. for stats page and dropdowns. */
export const TAG_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(TAGS).map(([tag, { label }]) => [tag, label])
)

// Side-rail muted variant — intentionally different visual treatment (10%-tint
// backgrounds with darker foreground text) than the canonical palette above.
// Do NOT change these values to match TAGS; the divergence is intentional and
// unifying the two visual styles is out of scope.
export const TAG_MUTED_PILL: Record<string, { label: string; bg: string; fg: string }> = {
  sismo:             { label: 'Sismo',            bg: 'bg-[#CF1020]/10', fg: 'text-[#8A0E15]' },
  rescate:           { label: 'Rescate',          bg: 'bg-[#6B3A52]/10', fg: 'text-[#4A2839]' },
  desaparecidos:     { label: 'Desaparecidos',    bg: 'bg-[#B5502E]/10', fg: 'text-[#7A3720]' },
  puntos_acopio:     { label: 'Acopio',           bg: 'bg-[#5C7A4A]/10', fg: 'text-[#3F5433]' },
  ayuda_humanitaria: { label: 'Ayuda',            bg: 'bg-[#3D5A73]/10', fg: 'text-[#2A3F50]' },
  replicas:          { label: 'Réplicas',         bg: 'bg-[#A67C2E]/10', fg: 'text-[#755720]' },
  donaciones:        { label: 'Donar',            bg: 'bg-[#3E7C6E]/10', fg: 'text-[#2B564C]' },
  internacional:     { label: 'Int.',             bg: 'bg-[#8A8378]/10', fg: 'text-[#5F5A52]' },
}
