// 「使えるお金」(お小遣い制の月次予算)。家計の収入とは別枠で、
// ユーザーごとに開始日・締日・月額を持ち、その人自身が記録した支出
// (締日までの未来日付も含む)を差し引いた残額を計算する。

function pad(n) {
  return String(n).padStart(2, '0')
}

function toStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function clampDay(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return Math.min(Math.max(day, 1), lastDay)
}

function makeDate(year, month, day) {
  return new Date(year, month, clampDay(year, month, day))
}

// startDay/endDay は「日」(1〜31)。endDay < startDay なら月をまたぐサイクル
// (例: 開始25日・締め24日 → 25日〜翌月24日)として扱う。
export function cycleRange(startDay, endDay, todayStr) {
  const today = new Date(`${todayStr}T00:00:00`)
  const y = today.getFullYear()
  const m = today.getMonth()

  let start
  let end
  if (startDay <= endDay) {
    start = makeDate(y, m, startDay)
    end = makeDate(y, m, endDay)
    if (today < start) {
      start = makeDate(y, m - 1, startDay)
      end = makeDate(y, m - 1, endDay)
    } else if (today > end) {
      start = makeDate(y, m + 1, startDay)
      end = makeDate(y, m + 1, endDay)
    }
  } else {
    start = makeDate(y, m, startDay)
    end = makeDate(y, m + 1, endDay)
    if (today < start) {
      start = makeDate(y, m - 1, startDay)
      end = makeDate(y, m, endDay)
    }
  }
  return { start: toStr(start), end: toStr(end) }
}

export function calcAllowance({ kakei, userId, allowance, todayStr }) {
  if (!allowance || !allowance.monthly) return null
  const startDay = allowance.startDay || 1
  const endDay = allowance.endDay || 31
  const { start, end } = cycleRange(startDay, endDay, todayStr)

  const spent = kakei
    .filter((r) => r.type === 'out' && r.by === userId && r.date >= start && r.date <= end)
    .reduce((sum, r) => sum + r.amount, 0)

  return { start, end, spent, monthly: allowance.monthly, remaining: allowance.monthly - spent }
}
