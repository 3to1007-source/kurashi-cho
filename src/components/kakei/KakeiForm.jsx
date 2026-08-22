import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { KAKEI_IN_CATEGORIES, KAKEI_OUT_CATEGORIES, todayStr } from '../../lib/constants'
import { recognizeReceipt, extractAmount, extractDate } from '../../lib/receiptOcr'
import { yen } from '../../lib/format'
import common from '../../styles/common.module.css'

export default function KakeiForm() {
  const { data, save, currentUser } = useApp()
  const outCategories = data.settings.kakeiOutCategories?.length ? data.settings.kakeiOutCategories : KAKEI_OUT_CATEGORIES
  const inCategories = data.settings.kakeiInCategories?.length ? data.settings.kakeiInCategories : KAKEI_IN_CATEGORIES

  const [type, setType] = useState('out')
  const [date, setDate] = useState(todayStr())
  const [category, setCategory] = useState(outCategories[0])
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrNote, setOcrNote] = useState('')
  const fileInputRef = useRef(null)

  const categories = type === 'out' ? outCategories : inCategories

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0] || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.join('|')])

  function handleType(nextType) {
    setType(nextType)
    const list = nextType === 'out' ? outCategories : inCategories
    setCategory(list[0] || '')
  }

  async function handleReceiptFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setOcrBusy(true)
    setOcrNote('')
    try {
      const text = await recognizeReceipt(file)
      const amt = extractAmount(text)
      const foundDate = extractDate(text, todayStr().slice(0, 4))

      if (amt) {
        setAmount(String(amt))
        setOcrNote(`レシートから金額${yen(amt)}円を読み取りました。内容を確認してください。`)
      } else {
        setOcrNote('金額を読み取れませんでした。手入力してください。')
      }
      if (foundDate) setDate(foundDate)
    } catch {
      setOcrNote('レシートの読み取りに失敗しました。手入力してください。')
    } finally {
      setOcrBusy(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) return
    save((prev) => ({
      ...prev,
      kakei: [
        ...prev.kakei,
        { id: crypto.randomUUID(), date, type, category, amount: amt, memo: memo.trim(), by: currentUser },
      ],
    }))
    setAmount('')
    setMemo('')
    setOcrNote('')
  }

  return (
    <form className={common.card} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className={common.toggle}>
        <button
          type="button"
          className={`${common.toggleBtn} ${type === 'out' ? common.toggleBtnActive : ''}`}
          onClick={() => handleType('out')}
        >
          支出
        </button>
        <button
          type="button"
          className={`${common.toggleBtn} ${type === 'in' ? common.toggleBtnActiveIn : ''}`}
          onClick={() => handleType('in')}
        >
          収入
        </button>
      </div>

      {type === 'out' && (
        <div className={common.formCol}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleReceiptFile}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrBusy}
            style={{
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius)',
              padding: 13,
              fontSize: 15,
              background: 'var(--paper)',
              color: 'var(--ink)',
              minHeight: 48,
            }}
          >
            {ocrBusy ? 'レシートを読み取っています…' : 'レシートを撮影して金額を読み取る'}
          </button>
          {ocrNote && <p className={common.note}>{ocrNote}</p>}
        </div>
      )}

      <div className={common.formCol}>
        <label htmlFor="kakei-date">日付</label>
        <input id="kakei-date" className={common.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className={common.formCol}>
        <label htmlFor="kakei-cat">分類</label>
        <select id="kakei-cat" className={common.select} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className={common.formCol}>
        <label htmlFor="kakei-amt">金額</label>
        <input
          id="kakei-amt"
          className={common.input}
          type="number"
          inputMode="numeric"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
      </div>

      <div className={common.formCol}>
        <label htmlFor="kakei-memo">メモ</label>
        <input id="kakei-memo" className={common.input} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="任意" />
      </div>

      <button className={common.submitBtn} type="submit">
        記録する
      </button>
    </form>
  )
}
