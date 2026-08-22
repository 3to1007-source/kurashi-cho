import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { yen } from '../../lib/format'
import styles from '../layout/SettingsSheet.module.css'

function clampDay(v) {
  return Math.min(31, Math.max(1, Number(v) || 1))
}

export default function PlannedExpensesSettings({ onBack, onClose }) {
  const { data, save } = useApp()
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')

  const householdCycle = data.settings.householdCycle || { startDay: 1, endDay: 31 }
  const plannedExpenses = data.settings.plannedExpenses || []
  const plannedTotal = plannedExpenses.reduce((sum, p) => sum + (p.amount || 0), 0)

  function updateHouseholdCycle(field, value) {
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        householdCycle: {
          ...(prev.settings.householdCycle || { startDay: 1, endDay: 31 }),
          [field]: clampDay(value),
        },
      },
    }))
  }

  function addPlannedExpense(e) {
    e.preventDefault()
    const text = label.trim()
    const amt = Number(amount) || 0
    if (!text || !amt) return
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        plannedExpenses: [...(prev.settings.plannedExpenses || []), { id: crypto.randomUUID(), label: text, amount: amt }],
      },
    }))
    setLabel('')
    setAmount('')
  }

  function updatePlannedAmount(id, value) {
    const amt = Number(value) || 0
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        plannedExpenses: (prev.settings.plannedExpenses || []).map((p) => (p.id === id ? { ...p, amount: amt } : p)),
      },
    }))
  }

  function deletePlannedExpense(id) {
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        plannedExpenses: (prev.settings.plannedExpenses || []).filter((p) => p.id !== id),
      },
    }))
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grip} />
        <div className={styles.sheetHeader}>
          <button className={styles.backBtn} onClick={onBack}>
            ‹ 戻る
          </button>
          <span className={styles.sheetTitle}>先取り支出(固定費)</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className={styles.section}>
          <p className={styles.small}>
            毎月あらかじめ分かっている支出をリストにしておき、開始日のタイミングで収入から差し引いて「今月家計で使えるお金」を出します。金額は毎月編集できます。
          </p>
          <div className={styles.row}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={householdCycle.startDay}
              onChange={(e) => updateHouseholdCycle('startDay', e.target.value)}
              placeholder="開始日"
            />
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={householdCycle.endDay}
              onChange={(e) => updateHouseholdCycle('endDay', e.target.value)}
              placeholder="締日"
            />
          </div>

          <form className={styles.section} onSubmit={addPlannedExpense}>
            <div className={styles.row}>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="項目名(例: 家賃)" />
            </div>
            <div className={styles.row}>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="金額"
              />
              <button className={styles.btnPrimary} type="submit">
                追加
              </button>
            </div>
          </form>

          {plannedExpenses.length === 0 && <p className={styles.small}>まだ登録されていません。</p>}
          {plannedExpenses.map((p) => (
            <div className={styles.row} key={p.id}>
              <span style={{ flex: '0 0 92px', fontSize: 15, alignSelf: 'center' }}>{p.label}</span>
              <input
                type="number"
                inputMode="numeric"
                value={p.amount}
                onChange={(e) => updatePlannedAmount(p.id, e.target.value)}
              />
              <button className={styles.kaizenDel} onClick={() => deletePlannedExpense(p.id)}>
                削除
              </button>
            </div>
          ))}
          {plannedExpenses.length > 0 && (
            <p className={styles.small}>
              合計: {yen(plannedTotal)}円 ・ 毎月{householdCycle.startDay}日はじまり、{householdCycle.endDay}日
              {householdCycle.endDay < householdCycle.startDay ? '(翌月)' : ''}締め。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
