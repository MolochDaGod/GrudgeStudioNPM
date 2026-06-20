export function appUrl(path = '') {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = String(path).replace(/^\//, '')
  return `${base}${normalized}`
}