import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, Loader2, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import './Search.css'

const Search = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const performSearch = async (searchQuery) => {
    setLoading(true)
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(searchQuery)}`)
      const data = response.data?.data || response.data?.products || []
      
      if (data.length > 0) {
        setResults(data)
      } else {
        // Fallback to local filtering if backend search is empty/not fully working
        const mockResults = [
          { id: 1, name: 'Smart Thermostat', category: 'Climate Control', price: 129000, img: 'https://images.unsplash.com/photo-1558002038-1091a1661116?w=400' },
          { id: 2, name: 'Security Camera', category: 'Security', price: 199000, img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400' },
          { id: 3, name: 'Smart Lock', category: 'Security', price: 249000, img: 'https://images.unsplash.com/photo-1527430258225-e73675ddb67a?w=400' },
        ].filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setResults(mockResults)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (product) => {
    addToRecentSearches(query)
    navigate(`/product/${product.id}`)
    onClose()
  }

  const addToRecentSearches = (searchTerm) => {
    if (!searchTerm.trim()) return
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-searches', JSON.stringify(updated))
  }

  const handleRecentClick = (searchTerm) => {
    setQuery(searchTerm)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-searches')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="search-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -20 }}
        className="search-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="search-header">
          <div className="search-input-wrapper">
            <SearchIcon size={20} className="search-icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="search-input"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="clear-btn">
                <X size={18} />
              </button>
            )}
          </div>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="search-content">
          {loading && (
            <div className="search-loading">
              <Loader2 size={32} className="animate-spin" />
              <p>Qidirilmoqda...</p>
            </div>
          )}

          {!loading && query.length > 2 && results.length > 0 && (
            <div className="search-results">
              <div className="results-header">
                <span className="results-count">{results.length} ta natija</span>
              </div>
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleResultClick(result)}
                  className="search-result-item"
                >
                  <img src={result.img} alt={result.name} className="result-image" />
                  <div className="result-info">
                    <p className="result-name">{result.name}</p>
                    <p className="result-category">{result.category}</p>
                  </div>
                  <div className="result-price">
                    {result.price?.toLocaleString('uz-UZ')} so'm
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && query.length > 2 && results.length === 0 && (
            <div className="search-empty">
              <SearchIcon size={48} className="empty-icon" />
              <p>Natija topilmadi</p>
            </div>
          )}

          {!loading && query.length <= 2 && (
            <div className="search-recent">
              {recentSearches.length > 0 && (
                <div className="recent-section">
                  <div className="recent-header">
                    <span className="recent-title">So'nggi qidirishlar</span>
                    <button onClick={clearRecentSearches} className="clear-recent">
                  Tozalash
                </button>
                  </div>
                  <div className="recent-list">
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleRecentClick(search)}
                        className="recent-item"
                      >
                        <SearchIcon size={14} />
                        {search}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="trending-section">
                <div className="trending-header">
                  <TrendingUp size={16} />
                  <span className="trending-title">Ommabop mahsulotlar</span>
                </div>
                <div className="trending-list">
                  {['Smart Thermostat', 'Security Camera', 'Smart Lock', 'Light Controller'].map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleRecentClick(item)}
                      className="trending-item"
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Search
