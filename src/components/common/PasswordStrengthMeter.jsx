import { passwordStrength } from '../../lib/format'
import styles from '../auth/Auth.module.css'

const LEVELS = [
  { label: '弱い', color: '#b33a2b' },
  { label: 'やや弱い', color: '#b8811c' },
  { label: '普通', color: '#b8811c' },
  { label: '強い', color: '#3f7d63' },
  { label: 'とても強い', color: '#3f7d63' },
]

export default function PasswordStrengthMeter({ password }) {
  const score = passwordStrength(password)
  const level = LEVELS[score]
  const pct = ((score + 1) / LEVELS.length) * 100

  return (
    <div>
      <div className={styles.strengthTrack}>
        <div className={styles.strengthFill} style={{ width: `${pct}%`, background: level.color }} />
      </div>
      <div className={styles.strengthLabel}>強度: {level.label}</div>
    </div>
  )
}
