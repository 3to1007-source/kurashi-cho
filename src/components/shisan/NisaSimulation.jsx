import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { nisaSimulation, NISA_ANNUAL_LIMIT } from '../../lib/tax'
import { yen } from '../../lib/format'
import common from '../../styles/common.module.css'
import styles from './Shisan.module.css'

export default function NisaSimulation() {
  const { data, save } = useApp()
  const { nisaMonthly, nisaYears, nisaReturn } = data.settings

  function update(field, value) {
    save((prev) => ({ ...prev, settings: { ...prev.settings, [field]: Number(value) || 0 } }))
  }

  const result = useMemo(
    () => nisaSimulation({ monthly: nisaMonthly, years: nisaYears, returnPct: nisaReturn }),
    [nisaMonthly, nisaYears, nisaReturn]
  )

  const usagePct = Math.round(result.usageRate * 100)
  const over = result.usageRate > 1

  return (
    <div className={common.card} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className={common.formRow}>
        <div className={common.formCol}>
          <label>毎月積立額</label>
          <input className={common.input} type="number" value={nisaMonthly} onChange={(e) => update('nisaMonthly', e.target.value)} />
        </div>
        <div className={common.formCol}>
          <label>年数</label>
          <input className={common.input} type="number" value={nisaYears} onChange={(e) => update('nisaYears', e.target.value)} />
        </div>
        <div className={common.formCol}>
          <label>想定年利(%)</label>
          <input
            className={common.input}
            type="number"
            step="0.1"
            value={nisaReturn}
            onChange={(e) => update('nisaReturn', e.target.value)}
          />
        </div>
      </div>

      <div>
        <div className={common.note}>
          年間投資枠消化率 {usagePct}%(上限{yen(NISA_ANNUAL_LIMIT)}円)
        </div>
        <div className={styles.usageTrack}>
          <div
            className={`${styles.usageFill} ${over ? styles.usageOver : ''}`}
            style={{ width: `${Math.min(100, usagePct)}%` }}
          />
        </div>
      </div>

      <div className={styles.resultGrid}>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>元本</span>
          <span className={styles.resultValue}>{yen(result.principal)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>将来価値</span>
          <span className={styles.resultValue}>{yen(result.fv)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>運用益</span>
          <span className={styles.resultValue}>{yen(result.gain)}</span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>節税額(概算)</span>
          <span className={styles.resultValue} style={{ color: 'var(--yamabuki)' }}>
            {yen(result.taxSaved)}
          </span>
        </div>
        <div className={styles.resultItem}>
          <span className={styles.resultLabel}>課税口座なら手取り</span>
          <span className={styles.resultValue}>{yen(result.taxedTakeHome)}</span>
        </div>
      </div>
    </div>
  )
}
