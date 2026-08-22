import { yen } from '../../lib/format'
import styles from './Shisan.module.css'

export default function FurusatoStamp({ limit }) {
  return (
    <div className={styles.stampWrap}>
      <div className={styles.stamp}>
        <span className={styles.stampLabel}>ふるさと納税上限</span>
        <span className={styles.stampValue}>{yen(limit)}</span>
        <span className={styles.stampUnit}>円 / 年</span>
      </div>
    </div>
  )
}
