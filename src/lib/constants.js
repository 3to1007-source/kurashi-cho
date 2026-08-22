export const VAULT_KEY = 'kurashicho:vault'
export const BOOK_ID_KEY = 'kurashicho:bookId'
export const DEVICE_KEY_KEY = 'kurashicho:deviceKey'
export const DEVICE_WRAP_KEY = 'kurashicho:deviceWrap'
export const DEVICE_USER_KEY = 'kurashicho:deviceUser'

export const KAKEI_OUT_CATEGORIES = ['食費', '住居', '光熱・通信', '交通', '日用品', '医療', '交際・娯楽', 'その他']
export const KAKEI_IN_CATEGORIES = ['給与・役員報酬', '事業・副業', '賞与', 'その他']

export const IDLE_LIMIT_MS = 10 * 60 * 1000
export const LOGIN_FAIL_LIMIT = 5
export const LOGIN_LOCK_MS = 30 * 1000

export function emptyData() {
  return {
    kakei: [],
    karada: [],
    yotei: [],
    settings: {
      kyuyo: 0,
      jigyoUriage: 0,
      jigyoKeihi: 0,
      aoiro: 650000,
      shakaiHoken: 0,
      otherKojo: 0,
      nisaMonthly: 30000,
      nisaYears: 20,
      nisaReturn: 4,
      allowances: {},
      categoryBudgets: {},
      householdCycle: { startDay: 1, endDay: 31 },
      plannedIncome: [],
      plannedExpenses: [],
      kakeiOutCategories: [...KAKEI_OUT_CATEGORIES],
      kakeiInCategories: [...KAKEI_IN_CATEGORIES],
      theme: '',
    },
  }
}

export function todayStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
