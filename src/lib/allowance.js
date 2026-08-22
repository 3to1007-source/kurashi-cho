// 「使えるお金」(お小遣い制の月次予算)。家計の収入とは別枠で、
// ユーザーごとに開始日・締日・月額を持ち、その人自身が記録した支出
// (締日までの未来日付も含む)を差し引いた残額を計算する。

import { nextBusinessDay, prevBusinessDay } from './holidays'

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

// カテゴリ予算: 分類ごとの月の予算(誰が記録した支出でも合算する)。暦月(1日〜月末)固定。
export function calcCategoryBudget({ kakei, category, monthly, todayStr }) {
  if (!monthly) return null
  const month = todayStr.slice(0, 7)

  const spent = kakei
    .filter((r) => r.type === 'out' && r.category === category && r.date.slice(0, 7) === month)
    .reduce((sum, r) => sum + r.amount, 0)

  return { month, spent, monthly, remaining: monthly - spent }
}

// 家計全体の残金。実際に記録された取引を待たず、開始日のタイミングで
// 事前登録した予定収入(給料など)と先取り支出(家賃・光熱費など)を
// あらかじめ差し引きして「今月家計で使えるお金」を出す。どちらも金額は
// 毎月その場で編集できる。
export function calcHouseholdBudget({ plannedIncome, plannedExpenses, cycle, todayStr }) {
  const incomeItems = plannedIncome || []
  const expenseItems = plannedExpenses || []
  if (incomeItems.length === 0 && expenseItems.length === 0) return null

  const startDay = cycle?.startDay || 1
  const endDay = cycle?.endDay || 31
  const { start, end } = cycleRange(startDay, endDay, todayStr)

  const income = incomeItems.reduce((sum, p) => sum + (p.amount || 0), 0)
  const plannedTotal = expenseItems.reduce((sum, p) => sum + (p.amount || 0), 0)

  return { start, end, income, plannedTotal, remaining: income - plannedTotal }
}

function scheduledDatesForMonth(items, year, month, shiftFn, type) {
  const lastDay = new Date(year, month, 0).getDate()
  const result = {}

  ;(items || []).forEach((p) => {
    if (!p.payDay) return
    const day = Math.min(Math.max(p.payDay, 1), lastDay)
    const raw = `${year}-${pad(month)}-${pad(day)}`
    const actual = shiftFn(raw)
    if (!result[actual]) result[actual] = []
    result[actual].push({ label: p.label, amount: p.amount, type })
  })

  return result
}

// 先取り支出の支払い日を、指定した月(year, 1-12のmonth)について計算する。
// 土日祝に当たる場合は翌営業日にずらす。日付ごとにその日が支払い日の項目一覧を返す。
export function paymentDatesForMonth(plannedExpenses, year, month) {
  return scheduledDatesForMonth(plannedExpenses, year, month, nextBusinessDay, 'out')
}

// 予定収入(給料など)の受取日を、指定した月について計算する。
// 土日祝に当たる場合は前営業日にずらす(給料日の一般的な扱いに合わせる)。
export function incomeDatesForMonth(plannedIncome, year, month) {
  return scheduledDatesForMonth(plannedIncome, year, month, prevBusinessDay, 'in')
}
