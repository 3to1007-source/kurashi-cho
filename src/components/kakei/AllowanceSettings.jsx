import { useApp } from '../../context/AppContext'
import styles from '../layout/SettingsSheet.module.css'

function clampDay(v) {
  return Math.min(31, Math.max(1, Number(v) || 1))
}

export default function AllowanceSettings({ onBack, onClose }) {
  const { data, save, currentUser } = useApp()
  const allowance = data.settings.allowances?.[currentUser] || { monthly: 0, startDay: 1, endDay: 31 }

  function updateAllowance(field, value) {
    const nextValue = field === 'monthly' ? Number(value) || 0 : clampDay(value)
    save((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowances: {
          ...prev.settings.allowances,
          [currentUser]: {
            ...(prev.settings.allowances?.[currentUser] || { monthly: 0, startDay: 1, endDay: 31 }),
            [field]: nextValue,
          },
        },
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
          <span className={styles.sheetTitle}>使えるお金({currentUser})</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <div className={styles.section}>
          <p className={styles.small}>家計の収入とは別枠の、自分の支出だけを差し引く月々の予算です。</p>
          <div className={styles.row}>
            <input
              type="number"
              inputMode="numeric"
              value={allowance.monthly || ''}
              onChange={(e) => updateAllowance('monthly', e.target.value)}
              placeholder="月の金額"
            />
          </div>
          <div className={styles.row}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={allowance.startDay}
              onChange={(e) => updateAllowance('startDay', e.target.value)}
              placeholder="開始日"
            />
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={allowance.endDay}
              onChange={(e) => updateAllowance('endDay', e.target.value)}
              placeholder="締日"
            />
          </div>
          <p className={styles.small}>
            毎月{allowance.startDay}日はじまり、{allowance.endDay}日{allowance.endDay < allowance.startDay ? '(翌月)' : ''}締め。
          </p>
        </div>
      </div>
    </div>
  )
}
