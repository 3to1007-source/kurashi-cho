// 税額試算ロジック。概算・目安であり、正式な金額は税理士や公式シミュレーターで確認すること。

export function kyuyoKoujo(income) {
  const i = Math.max(0, income)
  if (i <= 1900000) return Math.min(i, 650000)
  if (i <= 3600000) return i * 0.3 + 80000
  if (i <= 6600000) return i * 0.2 + 440000
  if (i <= 8500000) return i * 0.1 + 1100000
  return 1950000
}

const SHOTOKUZEI_TABLE = [
  { max: 1950000, rate: 0.05, deduction: 0 },
  { max: 3300000, rate: 0.1, deduction: 97500 },
  { max: 6950000, rate: 0.2, deduction: 427500 },
  { max: 9000000, rate: 0.23, deduction: 636000 },
  { max: 18000000, rate: 0.33, deduction: 1536000 },
  { max: 40000000, rate: 0.4, deduction: 2796000 },
  { max: Infinity, rate: 0.45, deduction: 4796000 },
]

export function shotokuzeiSpeed(taxable) {
  const t = Math.max(0, taxable)
  return SHOTOKUZEI_TABLE.find((row) => t <= row.max)
}

export function calcTax({ kyuyo = 0, jigyoUriage = 0, jigyoKeihi = 0, aoiro = 650000, shakaiHoken = 0, otherKojo = 0 }) {
  const kyuyoShotoku = Math.max(0, kyuyo - kyuyoKoujo(kyuyo))
  const jigyoShotoku = Math.max(0, jigyoUriage - jigyoKeihi - aoiro)
  const goukeiShotoku = kyuyoShotoku + jigyoShotoku

  const kazeiShotokuzei = Math.max(0, goukeiShotoku - shakaiHoken - otherKojo - 580000)
  const kazeiJuminzei = Math.max(0, goukeiShotoku - shakaiHoken - otherKojo - 430000)

  const juminzeiShotokuwari = kazeiJuminzei * 0.1

  const { rate, deduction } = shotokuzeiSpeed(kazeiShotokuzei)
  const shotokuzeigakuBase = Math.max(0, kazeiShotokuzei * rate - deduction)
  const shotokuzeigaku = shotokuzeigakuBase * 1.021

  const bunbo = 0.9 - rate * 1.021
  let furusatoLimit = 0
  if (bunbo > 0) {
    const raw = (juminzeiShotokuwari * 0.2) / bunbo + 2000
    furusatoLimit = Math.floor(Math.max(0, raw) / 1000) * 1000
  }

  return {
    kyuyoShotoku,
    jigyoShotoku,
    goukeiShotoku,
    kazeiShotokuzei,
    kazeiJuminzei,
    juminzeiShotokuwari,
    shotokuzeiRate: rate,
    shotokuzeigaku,
    furusatoLimit,
  }
}

const NISA_ANNUAL_LIMIT = 3600000
const NISA_TAX_RATE = 0.20315

export function nisaSimulation({ monthly = 0, years = 0, returnPct = 0 }) {
  const i = returnPct / 100 / 12
  const m = Math.max(0, Math.round(years * 12))
  const principal = monthly * m
  const fv = i === 0 ? principal : monthly * ((Math.pow(1 + i, m) - 1) / i)
  const gain = Math.max(0, fv - principal)
  const taxedTakeHome = principal + gain * (1 - NISA_TAX_RATE)
  const taxSaved = gain * NISA_TAX_RATE

  const annualInvestment = monthly * 12
  const usageRate = annualInvestment / NISA_ANNUAL_LIMIT

  return { principal, fv, gain, taxedTakeHome, taxSaved, usageRate, annualInvestment }
}

export { NISA_ANNUAL_LIMIT }
