import { yen } from '../../lib/format'
import styles from './Kakei.module.css'

export default function KakeiChart({ records }) {
  const totals = {}
  records.forEach((r) => {
    totals[r.category] = (totals[r.category] || 0) + r.amount
  })
  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1])
  const max = rows.length ? rows[0][1] : 0

  if (rows.length === 0) return null

  return (
    <div>
      {rows.map(([category, amount]) => (
        <div className={styles.barRow} key={category}>
          <span className={styles.barLabel}>{category}</span>
          <span className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${max ? (amount / max) * 100 : 0}%` }} />
          </span>
          <span className={styles.barValue}>{yen(amount)}</span>
        </div>
      ))}
    </div>
  )
}
