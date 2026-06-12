import { useState, useEffect, useCallback } from 'react'

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return
  try {
    if (value === undefined || value === null || value === '') {
      localStorage.removeItem(key)
      return
    }
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / private mode */
  }
}

/** State that survives page refresh via localStorage */
export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => readStorage(key, initialValue))

  useEffect(() => {
    writeStorage(key, state)
  }, [key, state])

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(key)
    setState(initialValue)
  }, [key, initialValue])

  return [state, setState, clear]
}
