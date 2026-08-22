// レシート写真からのOCR。ブラウザ内で完結する(Tesseract.js、WASM)。
// 画像はサーバーやどこにも送信されない。読み取り結果は不完全なことが
// あるため、必ず利用者が確認・修正できる前提で使う。

function pad(n) {
  return String(n).padStart(2, '0')
}

export async function recognizeReceipt(imageFile, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('jpn', 1, {
    logger: onProgress,
  })
  try {
    const { data } = await worker.recognize(imageFile)
    return data.text
  } finally {
    await worker.terminate()
  }
}

const AMOUNT_KEYWORDS = ['合計', 'ご合計', 'お会計', '総額', '税込合計', '合計金額', 'お買上げ額']

function numberFromLine(line) {
  const m = line.match(/([0-9][0-9,]{2,})/)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

export function extractAmount(text) {
  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    if (AMOUNT_KEYWORDS.some((k) => line.includes(k))) {
      const n = numberFromLine(line)
      if (n) return n
    }
  }

  const numbers = [...text.matchAll(/([0-9][0-9,]{2,})\s?円/g)]
    .map((m) => Number(m[1].replace(/,/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 1000000)

  if (numbers.length === 0) return null
  return Math.max(...numbers)
}

export function extractDate(text, fallbackYear) {
  let m = text.match(/(20\d{2})[年/\-.](\d{1,2})[月/\-.](\d{1,2})/)
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`

  if (fallbackYear) {
    m = text.match(/(\d{1,2})[/\-](\d{1,2})/)
    if (m) return `${fallbackYear}-${pad(m[1])}-${pad(m[2])}`
  }

  return null
}
