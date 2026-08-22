import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { calcTax } from '../../lib/tax'
import { yen } from '../../lib/format'
import { todayStr } from '../../lib/constants'
import FurusatoStamp from './FurusatoStamp'
import NisaSimulation from './NisaSimulation'
import common from '../../styles/common.module.css'
import styles from './Shisan.module.css'

const FIELDS = [
  { key: 'kyuyo', label: '給与収入' },
  { key: 'jigyoUriage', label: '事業・副業の売上' },
  { key: 'jigyoKeihi', label: '事業の経費' },
  { key: 'aoiro', label: '青色申告特別控除' },
  { key: 'shakaiHoken', label: '社会保険料' },
  { key: 'otherKojo', label: 'その他の控除' },
]

export default function ShisanTab() {
  const { data, save } = useApp()
  const { settings } = data

  function update(field, value) {
    save((prev) => ({ ...prev, settings: { ...prev.settings, [field]: Number(value) || 0 } }))
  }

  function importFromKakei() {
    const thisYear = todayStr().slice(0, 4)
    let kyuyo = 0
    let jigyoUriage = 0
    let keihi = 0
    data.kakei
      .filter((r) => r.date.startsWith(thisYear))
      .forEach((r) => {
        if (r.type === 'in') {
          if (r.category === '給与・役員報酬' || r.category === '賞与') kyuyo += r.amount
          else if (r.category === '事業・副業') jigyoUriage += r.amount
        } else {
          keihi += r.amount
        }
      })
    save((prev) => ({
      ...prev,
      settings: { ...prev.settings, kyuyo, jigyoUriage, jigyoKeihi: keihi },
    }))
  }

  const result = useMemo(() => calcTax(settings), [settings])

  return (
    <div>
      <section className={common.section}>
        <div className={common.sectionTitle}>収入と控除</div>
        <div className={common.card} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className={common.submitBtn} style={{ background: 'var(--yamabuki)' }} onClick={importFromKakei}>
            その年の家計簿から取り込む
          </button>
          {FIELDS.map((f) => (
            <div className={common.formCol} key={f.key}>
              <label>{f.label}</label>
              <input
                className={common.input}
                type="number"
                value={settings[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={common.section}>
        <div className={common.sectionTitle}>試算結果</div>
        <div className={common.card}>
          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>給与所得</span>
              <span className={styles.resultValue}>{yen(result.kyuyoShotoku)}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>事業所得</span>
              <span className={styles.resultValue}>{yen(result.jigyoShotoku)}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>合計所得</span>
              <span className={styles.resultValue}>{yen(result.goukeiShotoku)}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>所得税額(概算)</span>
              <span className={styles.resultValue}>{yen(result.shotokuzeigaku)}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>住民税所得割</span>
              <span className={styles.resultValue}>{yen(result.juminzeiShotokuwari)}</span>
            </div>
          </div>
          <FurusatoStamp limit={result.furusatoLimit} />
          <p className={common.note}>
            ※ここに表示される金額はすべて概算・目安です。実際の税額は税理士や自治体・国税庁の公式シミュレーターでご確認ください。
          </p>
        </div>
      </section>

      <section className={common.section}>
        <div className={common.sectionTitle}>NISAシミュレーション</div>
        <NisaSimulation />
        <p className={common.note}>
          ※一般的な積立計算であり、特定の金融商品を推奨するものではありません。実際の運用成果を保証するものではありません。
        </p>
      </section>
    </div>
  )
}
