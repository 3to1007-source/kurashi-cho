import { useApp } from '../../context/AppContext'
import { yen } from '../../lib/format'
import common from '../../styles/common.module.css'

export default function KakeiList({ records }) {
  const { save } = useApp()

  function remove(id) {
    save((prev) => ({ ...prev, kakei: prev.kakei.filter((r) => r.id !== id) }))
  }

  const sorted = [...records].sort((a, b) => (a.date < b.date ? 1 : -1))

  if (sorted.length === 0) {
    return <p className={common.empty}>今月の記録はまだありません。上のフォームから記録してみましょう。</p>
  }

  return (
    <div className={common.list}>
      {sorted.map((r) => (
        <div className={common.listItem} key={r.id}>
          <div className={common.listMain}>
            <div className={common.listTitle}>
              {r.category}
              {r.memo && ` ・ ${r.memo}`}
            </div>
            <div className={common.listMeta}>
              {r.date} ・ {r.by}
            </div>
          </div>
          <div className={common.listAmount} style={{ color: r.type === 'out' ? 'var(--shu)' : 'var(--take)' }}>
            {r.type === 'out' ? '−' : '+'}
            {yen(r.amount)}
          </div>
          <button className={common.deleteBtn} onClick={() => remove(r.id)}>
            削除
          </button>
        </div>
      ))}
    </div>
  )
}
