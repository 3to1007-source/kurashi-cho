// 日本の祝日判定(概算)。政府公式の祝日データではなく、現行の祝日法に基づく
// 計算式を用いた近似(春分・秋分は天文学的近似式)。先取り支出の支払い日を
// 「土日祝を避けて翌営業日にずらす」用途での利用を想定している。

function pad(n) {
  return String(n).padStart(2, '0')
}

function toStr(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`
}

// 第n月曜日(ハッピーマンデー)の日付を返す
function nthMonday(year, month, n) {
  const first = new Date(year, month - 1, 1)
  const firstMonday = 1 + ((8 - first.getDay()) % 7)
  return firstMonday + (n - 1) * 7
}

function shunbun(year) {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

function shubun(year) {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

function fixedHolidays(year) {
  const set = new Set([
    toStr(year, 1, 1), // 元日
    toStr(year, 2, 11), // 建国記念の日
    toStr(year, 2, 23), // 天皇誕生日
    toStr(year, 4, 29), // 昭和の日
    toStr(year, 5, 3), // 憲法記念日
    toStr(year, 5, 4), // みどりの日
    toStr(year, 5, 5), // こどもの日
    toStr(year, 8, 11), // 山の日
    toStr(year, 11, 3), // 文化の日
    toStr(year, 11, 23), // 勤労感謝の日
    toStr(year, 1, nthMonday(year, 1, 2)), // 成人の日
    toStr(year, 7, nthMonday(year, 7, 3)), // 海の日
    toStr(year, 9, nthMonday(year, 9, 3)), // 敬老の日
    toStr(year, 10, nthMonday(year, 10, 2)), // スポーツの日
    toStr(year, 3, shunbun(year)), // 春分の日
    toStr(year, 9, shubun(year)), // 秋分の日
  ])
  return set
}

const cache = new Map()

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + n)
  return toStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function holidaySetForYear(year) {
  if (!cache.has(year)) {
    const base = fixedHolidays(year)

    // 国民の休日: 祝日ではない日の前後がどちらも祝日なら、その日も休日にする
    // (例: 敬老の日と秋分の日に挟まれた日)
    const nationalHolidayGaps = []
    base.forEach((dateStr) => {
      const between = addDays(dateStr, 1)
      if (!base.has(between) && base.has(addDays(between, 1))) {
        nationalHolidayGaps.push(between)
      }
    })
    nationalHolidayGaps.forEach((d) => base.add(d))

    // 振替休日: 祝日が日曜なら、その後の最初の非祝日平日を休日にする
    const substitutes = []
    base.forEach((dateStr) => {
      const d = new Date(`${dateStr}T00:00:00`)
      if (d.getDay() === 0) {
        const sub = new Date(d)
        do {
          sub.setDate(sub.getDate() + 1)
        } while (base.has(toStr(sub.getFullYear(), sub.getMonth() + 1, sub.getDate())))
        substitutes.push(toStr(sub.getFullYear(), sub.getMonth() + 1, sub.getDate()))
      }
    })
    substitutes.forEach((s) => base.add(s))
    cache.set(year, base)
  }
  return cache.get(year)
}

export function isJapaneseHoliday(dateStr) {
  const year = Number(dateStr.slice(0, 4))
  return holidaySetForYear(year).has(dateStr)
}

export function isWeekend(dateStr) {
  const day = new Date(`${dateStr}T00:00:00`).getDay()
  return day === 0 || day === 6
}

export function isBusinessDay(dateStr) {
  return !isWeekend(dateStr) && !isJapaneseHoliday(dateStr)
}

export function nextBusinessDay(dateStr) {
  let d = new Date(`${dateStr}T00:00:00`)
  let s = dateStr
  while (!isBusinessDay(s)) {
    d.setDate(d.getDate() + 1)
    s = toStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }
  return s
}

// 給料日など、休日なら前倒しで支払われる日付向け
export function prevBusinessDay(dateStr) {
  let d = new Date(`${dateStr}T00:00:00`)
  let s = dateStr
  while (!isBusinessDay(s)) {
    d.setDate(d.getDate() - 1)
    s = toStr(d.getFullYear(), d.getMonth() + 1, d.getDate())
  }
  return s
}
