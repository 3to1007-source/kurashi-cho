import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Header from './Header'
import TabBar from './TabBar'
import SettingsSheet from './SettingsSheet'
import KakeiTab from '../kakei/KakeiTab'
import KaradaTab from '../karada/KaradaTab'
import YoteiTab from '../yotei/YoteiTab'
import ShisanTab from '../shisan/ShisanTab'
import styles from './Shell.module.css'

export default function Shell() {
  const { data } = useApp()
  const [tab, setTab] = useState('kakei')
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!data) return null

  return (
    <div className={styles.shell}>
      <Header tab={tab} onOpenSettings={() => setSettingsOpen(true)} />
      <main className={styles.main}>
        {tab === 'kakei' && <KakeiTab />}
        {tab === 'karada' && <KaradaTab />}
        {tab === 'yotei' && <YoteiTab />}
        {tab === 'shisan' && <ShisanTab />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
