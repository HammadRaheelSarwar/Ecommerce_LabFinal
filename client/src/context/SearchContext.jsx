import { createContext, useContext, useState } from 'react'

const SearchContext = createContext(null)

export const SearchProvider = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')
  const [recent, setRecent]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('aa_recent_searches')) || [] } catch { return [] }
  })

  const openSearch  = () => setSearchOpen(true)
  const closeSearch = () => { setSearchOpen(false); setQuery('') }

  const addRecent = (term) => {
    if (!term.trim()) return
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 6)
    setRecent(updated)
    localStorage.setItem('aa_recent_searches', JSON.stringify(updated))
  }

  const clearRecent = () => {
    setRecent([])
    localStorage.removeItem('aa_recent_searches')
  }

  return (
    <SearchContext.Provider value={{ searchOpen, query, setQuery, recent, openSearch, closeSearch, addRecent, clearRecent }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within SearchProvider')
  return ctx
}
