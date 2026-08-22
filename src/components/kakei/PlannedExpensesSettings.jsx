import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { yen } from '../../lib/format'
import styles from '../layout/SettingsSheet.module.css'

function clampDay(v) {
  return Math.min(31, Math.max(1, Number(v) || 1))
}

export default function PlannedExpensesSettings({ onBack, onClose }) {
  const { data, save } = useApp()
  const [incomeLabel, setIncomeLabel] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomePayDay, setIncomePayDay] = useState('')
  const [expenseLabel, setExpenseLabel] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expensePayDay, setExpensePayDay] = useState('')

  const householdCycle = data.settings.householdCycle || { startDay: 1, endDay: 31 }
  const plannedIncome = data.settings.plannedIncome || []
  const plannedExpenses = data.settings.plannedExpenses || []
  const incomeTotal = plannedIncome.reduce((sum, p) => sum + (p.amount || 0), 0)
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

  function addPlannedItem(listKey, item) {
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [listKey]: [...(prev.settings[listKey] || []), { id: crypto.randomUUID(), ...item }],
      },
    }))
  }

  function updatePlannedItemField(listKey, id, field, value) {
    const nextValue = field === 'amount' ? Number(value) || 0 : field === 'payDay' ? (value ? clampDay(value) : null) : value
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [listKey]: (prev.settings[listKey] || []).map((p) => (p.id === id ? { ...p, [field]: nextValue } : p)),
      },
    }))
  }

  function deletePlannedItem(listKey, id) {
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [listKey]: (prev.settings[listKey] || []).filter((p) => p.id !== id),
      },
    }))
  }

  function addIncome(e) {
    e.preventDefault()
    const text = incomeLabel.trim()
    const amt = Number(incomeAmount) || 0
    if (!text || !amt) return
    addPlannedItem('plannedIncome', { label: text, amount: amt, payDay: incomePayDay ? clampDay(incomePayDay) : null })
    setIncomeLabel('')
    setIncomeAmount('')
    setIncomePayDay('')
  }

  function addExpense(e) {
    e.preventDefault()
    const text = expenseLabel.trim()
    const amt = Number(expenseAmount) || 0
    if (!text || !amt) return
    addPlannedItem('plannedExpenses', { label: text, amount: amt, payDay: expensePayDay ? clampDay(expensePayDay) : null })
    setExpenseLabel('')
    setExpenseAmount('')
    setExpensePayDay('')
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grip} />
        <div className={styles.sheetHeader}>
          <button className={styles.backBtn} onClick={onBack}>
            ‹ 戻る
          </button>
          <span className={styles.sheetTitle}>予定収入・先取り支出</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className={styles.section}>
          <p className={styles.small}>
            実際の入出金を待たず、開始日のタイミングで事前登録した金額どうしを差し引いて「今月家計で使えるお金」を出します。金額はどちらも毎月その場で編集できます。
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
          <p className={styles.small}>
            毎月{householdCycle.startDay}日はじまり、{householdCycle.endDay}日
            {householdCycle.endDay < householdCycle.startDay ? '(翌月)' : ''}締め。
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>予定収入(給料など)</div>
          <p className={styles.small}>給料日を登録すると予定タブのカレンダーに表示されます(土日祝の場合は自動で前営業日になります)。</p>
          <form className={styles.section} onSubmit={addIncome}>
            <div className={styles.row}>
              <input value={incomeLabel} onChange={(e) => setIncomeLabel(e.target.value)} placeholder="項目名(例: 給料)" />
            </div>
            <div className={styles.row}>
              <input
                type="number"
                inputMode="numeric"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                placeholder="金額"
              />
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                value={incomePayDay}
                onChange={(e) => setIncomePayDay(e.target.value)}
                placeholder="給料日(任意)"
              />
            </div>
            <button className={styles.btnPrimary} type="submit">
              追加
            </button>
          </form>
          {plannedIncome.length === 0 && <p className={styles.small}>まだ登録されていません。</p>}
          {plannedIncome.map((p) => (
            <div key={p.id} style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className={styles.row} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{p.label}</span>
                <button className={styles.kaizenDel} onClick={() => deletePlannedItem('plannedIncome', p.id)}>
                  削除
                </button>
              </div>
              <div className={styles.row}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={p.amount}
                  onChange={(e) => updatePlannedItemField('plannedIncome', p.id, 'amount', e.target.value)}
                  placeholder="金額"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="31"
                  value={p.payDay || ''}
                  onChange={(e) => updatePlannedItemField('plannedIncome', p.id, 'payDay', e.target.value)}
                  placeholder="給料日(任意)"
                />
              </div>
            </div>
          ))}
          {plannedIncome.length > 0 && <p className={styles.small}>合計: {yen(incomeTotal)}円</p>}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>先取り支出(固定費)</div>
          <p className={styles.small}>支払い日を登録すると予定タブのカレンダーに表示されます(土日祝の場合は自動で翌営業日になります)。</p>
          <form className={styles.section} onSubmit={addExpense}>
            <div className={styles.row}>
              <input value={expenseLabel} onChange={(e) => setExpenseLabel(e.target.value)} placeholder="項目名(例: 家賃)" />
            </div>
            <div className={styles.row}>
              <input
                type="number"
                inputMode="numeric"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="金額"
              />
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="31"
                value={expensePayDay}
                onChange={(e) => setExpensePayDay(e.target.value)}
                placeholder="支払い日(任意)"
              />
            </div>
            <button className={styles.btnPrimary} type="submit">
              追加
            </button>
          </form>

          {plannedExpenses.length === 0 && <p className={styles.small}>まだ登録されていません。</p>}
          {plannedExpenses.map((p) => (
            <div key={p.id} style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className={styles.row} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{p.label}</span>
                <button className={styles.kaizenDel} onClick={() => deletePlannedItem('plannedExpenses', p.id)}>
                  削除
                </button>
              </div>
              <div className={styles.row}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={p.amount}
                  onChange={(e) => updatePlannedItemField('plannedExpenses', p.id, 'amount', e.target.value)}
                  placeholder="金額"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="31"
                  value={p.payDay || ''}
                  onChange={(e) => updatePlannedItemField('plannedExpenses', p.id, 'payDay', e.target.value)}
                  placeholder="支払い日(任意)"
                />
              </div>
            </div>
          ))}
          {plannedExpenses.length > 0 && <p className={styles.small}>合計: {yen(plannedTotal)}円</p>}
        </div>
      </div>
    </div>
  )
}
