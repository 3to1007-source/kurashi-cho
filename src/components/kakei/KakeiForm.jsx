import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { KAKEI_IN_CATEGORIES, KAKEI_OUT_CATEGORIES, todayStr } from '../../lib/constants'
import common from '../../styles/common.module.css'

export default function KakeiForm() {
  const { save, currentUser } = useApp()
  const [type, setType] = useState('out')
  const [date, setDate] = useState(todayStr())
  const [category, setCategory] = useState(KAKEI_OUT_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')

  const categories = type === 'out' ? KAKEI_OUT_CATEGORIES : KAKEI_IN_CATEGORIES

  function handleType(nextType) {
    setType(nextType)
    setCategory(nextType === 'out' ? KAKEI_OUT_CATEGORIES[0] : KAKEI_IN_CATEGORIES[0])
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
