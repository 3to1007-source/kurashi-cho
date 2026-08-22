export function yen(n) {
  const v = Math.round(Number(n) || 0)
  return v.toLocaleString('ja-JP')
}

export function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : ''
}

export function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}
