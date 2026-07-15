export const TAG_COLOR_OPTIONS = ['red', 'amber', 'emerald', 'blue', 'violet', 'pink', 'cyan', 'slate'] as const
export type TagColorName = (typeof TAG_COLOR_OPTIONS)[number]

export const tagColorClass: Record<TagColorName, string> = {
  red: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
  amber: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  emerald: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  blue: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400',
  violet: 'border-transparent bg-violet-500/15 text-violet-600 dark:text-violet-400',
  pink: 'border-transparent bg-pink-500/15 text-pink-600 dark:text-pink-400',
  cyan: 'border-transparent bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  slate: 'border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-400',
}

export const tagSwatchClass: Record<TagColorName, string> = {
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-500',
}

export function resolveTagColorClass(color?: string): string {
  if (color && (TAG_COLOR_OPTIONS as readonly string[]).includes(color)) {
    return tagColorClass[color as TagColorName]
  }
  return tagColorClass.slate
}
