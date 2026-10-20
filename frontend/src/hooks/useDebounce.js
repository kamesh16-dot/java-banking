import { useCallback } from 'react'

export function useDebouncedCallback(fn, delay) {
  let timer
  return useCallback((...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}
