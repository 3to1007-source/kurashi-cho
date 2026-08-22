import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  hasVault,
  persist,
  reload,
  pullAndMerge,
  syncToRemote,
  getBookId,
  decryptVaultData,
  rememberDevice,
  forgetDevice,
  tryDeviceLogin,
} from './lib/vault'
import { isRemoteConfigured, subscribeRemote } from './lib/remote'
import { useIdleTimer } from './lib/useIdleTimer'
import { AppContext } from './context/AppContext'
import Boot from './components/auth/Boot'
import Setup from './components/auth/Setup'
import Login from './components/auth/Login'
import Join from './components/auth/Join'
import Shell from './components/layout/Shell'
import './App.css'

export default function App() {
  const [phase, setPhase] = useState('boot')
  const [vault, setVault] = useState(null)
  const [dek, setDek] = useState(null)
  const [data, setData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | ok | error

  const enterOpen = useCallback(({ vault: v, dek: d, data: dt, user }, opts = {}) => {
    setVault(v)
    setDek(d)
    setData(dt)
    setCurrentUser(user)
    setPhase('open')
    if (opts.remember !== false) {
      rememberDevice({ dek: d, user }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!hasVault()) {
      setPhase('setup')
      return
    }
    tryDeviceLogin().then((result) => {
      if (result) {
        enterOpen(result, { remember: false })
      } else {
        setPhase('login')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lock = useCallback(() => {
    forgetDevice()
    setDek(null)
    setData(null)
    setCurrentUser(null)
    setPhase('login')
  }, [])

  useIdleTimer(lock, phase === 'open')

  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  }, [data])

  const vaultRef = useRef(vault)
  useEffect(() => {
    vaultRef.current = vault
  }, [vault])

  const save = useCallback(
    async (updater) => {
      const nextData = typeof updater === 'function' ? updater(dataRef.current) : updater
      dataRef.current = nextData
      setData(nextData)
      const nextVault = await persist({ vault, dek, data: nextData, by: currentUser })
      setVault(nextVault)

      if (isRemoteConfigured()) {
        setSyncStatus('syncing')
        syncToRemote(nextVault)
          .then(() => setSyncStatus('ok'))
          .catch(() => setSyncStatus('error'))
      }
    },
    [vault, dek, currentUser]
  )

  const doReload = useCallback(async () => {
    if (isRemoteConfigured() && dek) {
      try {
        const merged = await pullAndMerge({ dek, localVault: vaultRef.current })
        if (merged) {
          setVault(merged.vault)
          setData(merged.data)
          dataRef.current = merged.data
          setSyncStatus('ok')
          return
        }
      } catch {
        setSyncStatus('error')
      }
    }
    const { vault: v, data: dt } = await reload({ dek })
    setVault(v)
    setData(dt)
    dataRef.current = dt
  }, [dek])

  // 帳面を開いた直後に一度だけ、他の端末の方が新しくないか確認する。
  useEffect(() => {
    if (phase !== 'open' || !dek) return
    pullAndMerge({ dek, localVault: vaultRef.current })
      .then((merged) => {
        if (merged) {
          setVault(merged.vault)
          setData(merged.data)
          dataRef.current = merged.data
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // 開いている間は、他の端末からの更新をリアルタイムに反映する。
  useEffect(() => {
    if (phase !== 'open' || !dek || !isRemoteConfigured()) return undefined
    const bookId = getBookId()
    if (!bookId) return undefined

    const unsubscribe = subscribeRemote(bookId, (remoteVault) => {
      const current = vaultRef.current
      if (current && remoteVault.updatedAt <= current.updatedAt) return
      decryptVaultData(dek, remoteVault)
        .then((nextData) => {
          setVault(remoteVault)
          setData(nextData)
          dataRef.current = nextData
        })
        .catch(() => {})
    })
    return unsubscribe
  }, [phase, dek])

  const ctxValue = useMemo(
    () => ({ vault, dek, data, currentUser, save, lock, reload: doReload, setVault, syncStatus, remoteConfigured: isRemoteConfigured() }),
    [vault, dek, data, currentUser, save, lock, doReload, syncStatus]
  )

  if (phase === 'boot') {
    return <Boot />
  }

  if (phase === 'setup') {
    return <Setup onDone={enterOpen} onHaveVault={() => setPhase('login')} onJoin={() => setPhase('join')} />
  }

  if (phase === 'join') {
    return <Join onDone={enterOpen} onBack={() => setPhase('setup')} />
  }

  if (phase === 'login') {
    return <Login onDone={enterOpen} />
  }

  return (
    <AppContext.Provider value={ctxValue}>
      <Shell />
    </AppContext.Provider>
  )
}
