import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { hasVault, persist, reload } from './lib/vault'
import { useIdleTimer } from './lib/useIdleTimer'
import { AppContext } from './context/AppContext'
import Boot from './components/auth/Boot'
import Setup from './components/auth/Setup'
import Login from './components/auth/Login'
import Shell from './components/layout/Shell'
import './App.css'

export default function App() {
  const [phase, setPhase] = useState('boot')
  const [vault, setVault] = useState(null)
  const [dek, setDek] = useState(null)
  const [data, setData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    setPhase(hasVault() ? 'login' : 'setup')
  }, [])

  const enterOpen = useCallback(({ vault: v, dek: d, data: dt, user }) => {
    setVault(v)
    setDek(d)
    setData(dt)
    setCurrentUser(user)
    setPhase('open')
  }, [])

  const lock = useCallback(() => {
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

  const save = useCallback(
    async (updater) => {
      const nextData = typeof updater === 'function' ? updater(dataRef.current) : updater
      dataRef.current = nextData
      setData(nextData)
      const nextVault = await persist({ vault, dek, data: nextData, by: currentUser })
      setVault(nextVault)
    },
    [vault, dek, currentUser]
  )

  const doReload = useCallback(async () => {
    const { vault: v, data: dt } = await reload({ dek })
    setVault(v)
    setData(dt)
  }, [dek])

  const ctxValue = useMemo(
    () => ({ vault, dek, data, currentUser, save, lock, reload: doReload, setVault }),
    [vault, dek, data, currentUser, save, lock, doReload]
  )

  if (phase === 'boot') {
    return <Boot />
  }

  if (phase === 'setup') {
    return <Setup onDone={enterOpen} onHaveVault={() => setPhase('login')} />
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
