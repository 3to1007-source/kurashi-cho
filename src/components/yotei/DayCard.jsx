import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { yen } from '../../lib/format'
import common from '../../styles/common.module.css'
import styles from './Yotei.module.css'

export default function DayCard({ date }) {
  const { data, save, currentUser } = useApp()
  const [time, setTime] = useState('09:00')
  const [title, setTitle] = useState('')

  const dayYotei = data.yotei.filter((y) => y.date === date).sort((a, b) => (a.time < b.time ? -1 : 1))
  const dayKakei = data.kakei.filter((k) => k.date === date)
  const dayKarada = data.karada.filter((k) => k.date === date)

  function addYotei(e) {
    e.preventDefault()
    if (!title.trim()) return
    save((prev) => ({
      ...prev,
      yotei: [...prev.yotei, { id: crypto.randomUUID(), date, time, title: title.trim(), by: currentUser }],
    }))
    setTitle('')
  }

  function removeYotei(id) {
    save((prev) => ({ ...prev, yotei: prev.yotei.filter((y) => y.id !== id) }))
  }

  return (
    <div className={styles.dayCard}>
      <div className={styles.dayTitle}>{date} の帳</div>

      <div className={styles.subSection}>
        <div className={styles.subHead} style={{ color: 'var(--ai)' }}>
          予定
        </div>
        {dayYotei.length === 0 && <p className={common.empty}>予定はありません。</p>}
        {dayYotei.map((y) => (
          <div className={styles.yoteiRow} key={y.id}>
            <span className={styles.yoteiTime}>{y.time}</span>
            <span className={styles.yoteiTitle}>{y.title}</span>
            <button className={common.deleteBtn} onClick={() => removeYotei(y.id)}>
              削除
            </button>
          </div>
        ))}
        <form className={common.formRow} onSubmit={addYotei}>
          <input
            className={common.input}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ flex: '0 0 100px' }}
          />
          <input
            className={common.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="予定の内容"
          />
          <button className={common.submitBtn} type="submit" style={{ flex: '0 0 auto' }}>
            追加
          </button>
        </form>
      </div>

      <div className={styles.subSection}>
        <div className={styles.subHead} style={{ color: 'var(--shu)' }}>
          家計
        </div>
        {dayKakei.length === 0 && <p className={common.empty}>この日の家計の記録はありません。</p>}
        {dayKakei.map((k) => (
          <div className={styles.yoteiRow} key={k.id}>
            <span className={styles.yoteiTitle}>
              {k.category}
              {k.memo && ` ・ ${k.memo}`}
            </span>
            <span className="num" style={{ color: k.type === 'out' ? 'var(--shu)' : 'var(--take)' }}>
              {k.type === 'out' ? '−' : '+'}
              {yen(k.amount)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.subSection}>
        <div className={styles.subHead} style={{ color: 'var(--take)' }}>
          からだ
        </div>
        {dayKarada.length === 0 && <p className={common.empty}>この日のからだの記録はありません。</p>}
        {dayKarada.map((k) => (
          <div className={styles.yoteiRow} key={`${k.who}-${k.date}`}>
            <span className={styles.yoteiTitle}>{k.who}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
              {k.weight != null && `${k.weight}kg `}
              {k.sleep != null && `睡眠${k.sleep}h `}
              {k.steps != null && `歩数${yen(k.steps)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
