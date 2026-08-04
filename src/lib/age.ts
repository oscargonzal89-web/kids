/**
 * Edad del niñ@ en meses, que es la unidad con la que trabaja todo el producto:
 * los rangos de `explore_plans` y el contexto que recibe Nani.
 *
 * Nota sobre la duplicación con `api/_nani-prompt.mjs`: la misma fórmula existe
 * allá porque las funciones de Vercel corren en otro runtime y no pueden
 * importar de `src/`. Es una decisión consciente, distinta del caso C2: ahí lo
 * duplicado era el prompt de Nani —cientos de líneas de criterio de producto
 * que sí divergen— y esto son tres líneas de aritmética sin criterio dentro.
 * Si algún día hay que tocarla, tocar las dos.
 */
export function calculateAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

/**
 * Igual que la anterior pero tolerante: devuelve `undefined` si no hay fecha o
 * si es inválida, en vez de `NaN`. Es lo que quieren los filtros, porque
 * `NaN` haría que la consulta a Supabase no devolviera nada y la pantalla se
 * vería vacía sin razón aparente.
 */
export function ageMonthsOrUndefined(birthDate?: string | null): number | undefined {
  if (!birthDate) return undefined
  const months = calculateAgeMonths(birthDate)
  if (!Number.isFinite(months) || months < 0) return undefined
  return months
}

/** Edad legible para mostrar en pantalla: "8 meses", "1 año", "2 años y 3 meses". */
export function formatAge(ageMonths: number): string {
  if (ageMonths < 12) {
    return ageMonths === 1 ? '1 mes' : `${ageMonths} meses`
  }
  const years = Math.floor(ageMonths / 12)
  const months = ageMonths % 12
  const yearsText = years === 1 ? '1 año' : `${years} años`
  if (months === 0) return yearsText
  return `${yearsText} y ${months === 1 ? '1 mes' : `${months} meses`}`
}
