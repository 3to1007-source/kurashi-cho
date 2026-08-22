import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { KAKEI_IN_CATEGORIES, KAKEI_OUT_CATEGORIES } from '../../lib/constants'
import styles from '../layout/SettingsSheet.module.css'

function CategoryList({ title, desc, listKey, categories, save }) {
  const [newName, setNewName] = useState('')

  function renameCategory(index, newValue) {
    save((prev) => {
      const list = prev.settings[listKey]?.length ? prev.settings[listKey] : categories
      const oldName = list[index]
      const trimmed = newValue
      if (oldName === undefined || trimmed === oldName) return prev
      if (list.includes(trimmed)) return prev
      const nextList = list.map((c, i) => (i === index ? trimmed : c))
      const nextSettings = { ...prev.settings, [listKey]: nextList }
      if (listKey === 'kakeiOutCategories' && prev.settings.categoryBudgets?.[oldName] != null) {
        const nextBudgets = { ...prev.settings.categoryBudgets }
        nextBudgets[trimmed] = nextBudgets[oldName]
        delete nextBudgets[oldName]
        nextSettings.categoryBudgets = nextBudgets
      }
      const kakeiType = listKey === 'kakeiOutCategories' ? 'out' : 'in'
      const nextKakei = prev.kakei.map((k) =>
        k.type === kakeiType && k.category === oldName ? { ...k, category: trimmed } : k
      )
      return { ...prev, kakei: nextKakei, settings: nextSettings }
    })
  }

  function deleteCategory(index) {
    save((prev) => {
      const list = prev.settings[listKey]?.length ? prev.settings[listKey] : categories
      if (list.length <= 1) return prev
      const removed = list[index]
      const nextList = list.filter((_, i) => i !== index)
      const nextSettings = { ...prev.settings, [listKey]: nextList }
      if (listKey === 'kakeiOutCategories' && prev.settings.categoryBudgets?.[removed] != null) {
        const nextBudgets = { ...prev.settings.categoryBudgets }
        delete nextBudgets[removed]
        nextSettings.categoryBudgets = nextBudgets
      }
      return { ...prev, settings: nextSettings }
    })
  }

  function addCategory(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    save((prev) => {
      const list = prev.settings[listKey]?.length ? prev.settings[listKey] : categories
      if (list.includes(trimmed)) return prev
      return { ...prev, settings: { ...prev.settings, [listKey]: [...list, trimmed] } }
    })
    setNewName('')
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <p className={styles.small}>{desc}</p>
      {categories.map((c, i) => (
        <div className={styles.row} key={`${listKey}-${i}`}>
          <input value={c} onChange={(e) => renameCategory(i, e.target.value)} />
          <button className={styles.kaizenDel} onClick={() => deleteCategory(i)} disabled={categories.length <= 1}>
            削除
          </button>
        </div>
      ))}
      <form className={styles.row} onSubmit={addCategory}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="新しい分類名" />
        <button className={styles.btnPrimary} type="submit">
          追加
        </button>
      </form>
    </div>
  )
}

export default function CategoryEditSettings({ onBack, onClose }) {
  const { data, save } = useApp()
  const outCategories = data.settings.kakeiOutCategories?.length ? data.settings.kakeiOutCategories : KAKEI_OUT_CATEGORIES
  const inCategories = data.settings.kakeiInCategories?.length ? data.settings.kakeiInCategories : KAKEI_IN_CATEGORIES

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grip} />
        <div className={styles.sheetHeader}>
          <button className={styles.backBtn} onClick={onBack}>
            ‹ 戻る
          </button>
          <span className={styles.sheetTitle}>分類の編集</span>
          <button className={styles.closeBtn} onClick={onClose}>
            閉じる
          </button>
        </div>

        <CategoryList
          title="支出の分類"
          desc="食費・住居など、記録フォームやカテゴリ予算で使う分類名です。名前を変えると、これまでの記録も新しい名前に揃います。"
          listKey="kakeiOutCategories"
          categories={outCategories}
          save={save}
        />
        <CategoryList
          title="収入の分類"
          desc="給与・賞与など、収入の記録フォームで使う分類名です。"
          listKey="kakeiInCategories"
          categories={inCategories}
          save={save}
        />
      </div>
    </div>
  )
}
