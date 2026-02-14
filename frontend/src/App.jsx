import { useEffect, useState } from 'react'
import api from './api'

import iconLibrary from './assets/discover.png'
import iconFavorites from './assets/favorites.png'
import iconReading from './assets/reading.png'
import iconToRead from './assets/toread.png'
import iconTopRated from './assets/toprated.png'
import iconNew from './assets/new.png'
import iconGenre from './assets/genre.png'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem('accessToken') || ''
  )
  const [username, setUsername] = useState(
    localStorage.getItem('username') || ''
  )

  // discover | favorites | reading | to_read | top_rated | new_arrivals | by_genre
  const [activeTab, setActiveTab] = useState('discover')

  const [showLogin, setShowLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const isLoggedIn = !!accessToken

  // favorites
  const [favoriteBookIds, setFavoriteBookIds] = useState(new Set())
  const [favoriteMap, setFavoriteMap] = useState({})

  // user-book status (READING, TO_READ)
  const [userBookMap, setUserBookMap] = useState({})

  // book details and reviews
  const [selectedBook, setSelectedBook] = useState(null)
  const [bookReviews, setBookReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // genres
  const [genres, setGenres] = useState([])
  const [selectedGenreId, setSelectedGenreId] = useState(null)
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)

  // -------------------- AUTH --------------------

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('auth/token/', {
        username: loginForm.username,
        password: loginForm.password,
      })
      const token = res.data.access
      setAccessToken(token)
      setUsername(loginForm.username)
      localStorage.setItem('accessToken', token)
      localStorage.setItem('username', loginForm.username)
      setShowLogin(false)
    } catch (err) {
      console.error('Login error:', err)
      alert('Login failed. Check username/password.')
    }
  }

  const handleLogout = () => {
    setAccessToken('')
    setUsername('')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('username')
    setSelectedBook(null)
  }

  // -------------------- FAVORITES --------------------

  const handleToggleFavorite = async (bookId) => {
    if (!isLoggedIn) {
      alert('You must be logged in to use favorites.')
      return
    }

    // remove from favorites if book is already in there
    if (favoriteBookIds.has(bookId)) {
      const favId = favoriteMap[bookId]
      if (!favId) {
        alert('Cannot remove from favorites: missing favorite id.')
        return
      }
      try {
        await api.delete(`favorites/${favId}/`)
        setFavoriteBookIds((prev) => {
          const copy = new Set(prev)
          copy.delete(bookId)
          return copy
        })
        setFavoriteMap((prev) => {
          const copy = { ...prev }
          delete copy[bookId]
          return copy
        })
      } catch (err) {
        console.error('Error removing favorite:', err)
        alert('Failed to remove from favorites.')
      }
      return
    }

    // add book to favorites if its not in there
    try {
      const res = await api.post('favorites/', { book: bookId })
      const created = res.data
      setFavoriteBookIds((prev) => {
        const copy = new Set(prev)
        copy.add(bookId)
        return copy
      })
      setFavoriteMap((prev) => ({
        ...prev,
        [bookId]: created.id,
      }))
    } catch (err) {
      console.error('Error adding to favorites:', err)
      alert('Failed to add to favorites.')
    }
  }

  // -------------------- TO READ / READING NOW --------------------

  const getBookRating = (b) => {
    return (
      b.avg_rating ??
      b.average_rating ??
      b.rating ??
      0
    )
  }

  const handleToggleToRead = async (bookId) => {
    if (!isLoggedIn) {
      alert('You must be logged in to use reading lists.')
      return
    }

    const existing = userBookMap[bookId]
    // TO_READ
    if (existing && existing.status === 'TO_READ') {
      try {
        await api.delete(`user/books/${existing.id}/`)
        setUserBookMap((prev) => {
          const copy = { ...prev }
          delete copy[bookId]
          return copy
        })
      } catch (err) {
        console.error('Error removing from TO_READ:', err)
        alert('Failed to remove from To Read.')
      }
      return
    }

    if (existing) {
      try {
        const res = await api.patch(`user/books/${existing.id}/`, {
          status: 'TO_READ',
        })
        const updated = res.data
        setUserBookMap((prev) => ({
          ...prev,
          [bookId]: { id: updated.id, status: updated.status },
        }))
      } catch (err) {
        console.error('Error updating status to TO_READ:', err)
        alert('Failed to update status.')
      }
      return
    }

    try {
      const res = await api.post('user/books/', {
        book: bookId,
        status: 'TO_READ',
      })
      const created = res.data
      setUserBookMap((prev) => ({
        ...prev,
        [bookId]: { id: created.id, status: created.status },
      }))
    } catch (err) {
      console.error('Error creating TO_READ status:', err)
      alert('Failed to mark as To Read.')
    }
  }

  const handleToggleReadingNow = async (bookId) => {
    if (!isLoggedIn) {
      alert('You must be logged in to use reading lists.')
      return
    }

    const existing = userBookMap[bookId]
    // READING NOW
    if (existing && existing.status === 'READING') {
      try {
        await api.delete(`user/books/${existing.id}/`)
        setUserBookMap((prev) => {
          const copy = { ...prev }
          delete copy[bookId]
          return copy
        })
      } catch (err) {
        console.error('Error removing from READING:', err)
        alert('Failed to remove from Reading now.')
      }
      return
    }

    if (existing) {
      try {
        const res = await api.patch(`user/books/${existing.id}/`, {
          status: 'READING',
        })
        const updated = res.data
        setUserBookMap((prev) => ({
          ...prev,
          [bookId]: { id: updated.id, status: updated.status },
        }))
      } catch (err) {
        console.error('Error updating to READING:', err)
        alert('Failed to update to Reading now.')
      }
      return
    }

    try {
      const res = await api.post('user/books/', {
        book: bookId,
        status: 'READING',
      })
      const created = res.data
      setUserBookMap((prev) => ({
        ...prev,
        [bookId]: { id: created.id, status: created.status },
      }))
    } catch (err) {
      console.error('Error creating READING status:', err)
      alert('Failed to mark as Reading now.')
    }
  }

  // -------------------- REVIEWS --------------------

  const loadReviewsForBook = async (bookId) => {
    setReviewsLoading(true)
    try {
      const res = await api.get('reviews/', { params: { book: bookId } })
      setBookReviews(res.data)
    } catch (err) {
      console.error('Error loading reviews:', err)
      setBookReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleAddReview = async (bookId) => {
    if (!isLoggedIn) {
      alert('You must be logged in to add a review.')
      return
    }

    const ratingStr = window.prompt('Rating (1-5):')
    if (!ratingStr) return
    const rating = Number(ratingStr)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert('Rating must be a number between 1 and 5.')
      return
    }

    const text = window.prompt('Your review text (optional):') || ''

    try {
      await api.post('reviews/', { book: bookId, rating, text })
      alert('Review submitted!')
      if (selectedBook && selectedBook.id === bookId) {
        await loadReviewsForBook(bookId)
      }
    } catch (err) {
      console.error('Error adding review:', err)
      alert('Failed to add review (maybe you already reviewed this book?).')
    }
  }

  // -------------------- BOOK DETAILS --------------------

  const openBookDetails = async (book) => {
    setSelectedBook(book)
    await loadReviewsForBook(book.id)
  }

  const closeBookDetails = () => {
    setSelectedBook(null)
    setBookReviews([])
  }

  // -------------------- LOAD DATA --------------------

  useEffect(() => {
    setLoading(true)
    api
      .get('books/')
      .then((res) => {
        setBooks(res.data)
      })
      .catch((err) => {
        console.error('Error loading books:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setFavoriteBookIds(new Set())
      setFavoriteMap({})
      return
    }
    api
      .get('favorites/')
      .then((res) => {
        const ids = new Set()
        const map = {}
        res.data.forEach((fav) => {
          ids.add(fav.book)
          map[fav.book] = fav.id
        })
        setFavoriteBookIds(ids)
        setFavoriteMap(map)
      })
      .catch((err) => console.error('Error loading favorites:', err))
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) {
      setUserBookMap({})
      return
    }
    api
      .get('user/books/')
      .then((res) => {
        const map = {}
        res.data.forEach((row) => {
          map[row.book] = { id: row.id, status: row.status }
        })
        setUserBookMap(map)
      })
      .catch((err) => console.error('Error loading user books:', err))
  }, [isLoggedIn])

  useEffect(() => {
    api
      .get('genres/')
      .then((res) => setGenres(res.data))
      .catch((err) => console.error('Error loading genres:', err))
  }, [])

  useEffect(() => {
    setLoading(true)
    api
      .get('books/')
      .then((res) => {
        console.log('Books from API:', res.data)
        setBooks(res.data)
      })
      .catch((err) => {
        console.error('Error loading books:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  // -------------------- FILTER / SORT --------------------

  const filteredBySearch = books.filter((b) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q) ||
      (b.authors || []).some((a) => a.name.toLowerCase().includes(q))
    )
  })

  const now = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(now.getDate() - 7)

  // default active tab filters
  const baseFiltered = filteredBySearch.filter((b) => {
    if (activeTab === 'favorites') {
      return favoriteBookIds.has(b.id)
    }
    if (activeTab === 'reading') {
      return userBookMap[b.id]?.status === 'READING'
    }
    if (activeTab === 'to_read') {
      return userBookMap[b.id]?.status === 'TO_READ'
    }
    if (activeTab === 'new_arrivals') {
      if (!b.created_at) return false
      const created = new Date(b.created_at)
      return created >= weekAgo
    }
    if (activeTab === 'by_genre') {
      if (!selectedGenreId) return true
      return (b.genres || []).some((g) => g.id === selectedGenreId)
    }
    if (activeTab === 'top_rated') {
      const r = getBookRating(b)
      return r >= 4
    }
    return true
  })

  let visibleBooks = [...baseFiltered]

  if (activeTab === 'top_rated') {
    visibleBooks.sort((a, b) => {
      const ar = getBookRating(a)
      const br = getBookRating(b)

      if (ar === br) {
        const ac = a.reviews_count ?? 0
        const bc = b.reviews_count ?? 0
        return bc - ac       // in case the rating is equal, the book with more reviews get upper
      }

      return br - ar         
    })
  } else if (activeTab === 'new_arrivals') {
    visibleBooks.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  }

  let sectionTitle = 'Discover books'
  if (activeTab === 'favorites') sectionTitle = 'My favorites'
  else if (activeTab === 'reading') sectionTitle = 'Reading now'
  else if (activeTab === 'to_read') sectionTitle = 'To read'
  else if (activeTab === 'top_rated') sectionTitle = 'Top rated'
  else if (activeTab === 'new_arrivals') sectionTitle = 'New arrivals'
  else if (activeTab === 'by_genre') sectionTitle = 'Books by genre'

  const visibleCount = visibleBooks.length

  // -------------------- RENDER --------------------

  return (
    <div className="app-root">
      <div className="app-shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">𝓵</div>
            <div className="sidebar-logo-text">
              <span>Onlibry</span>
              <span>online reading room</span>
            </div>
          </div>

          <div>
            <div className="sidebar-section-title">Library</div>
            <div className="sidebar-nav">
              <button
                className={activeTab === 'discover' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('discover')
                  setSelectedBook(null)
                  setShowGenreDropdown(false)
                }}
              >
                <span className="icon">
                  <img
                    src={iconLibrary}
                    alt="discover"
                    style={{ width: 16, height: 16 }}
                  />
                </span>
                <span>Discover</span>
              </button>

              <button
                className={activeTab === 'favorites' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('favorites')
                  setSelectedBook(null)
                  setShowGenreDropdown(false)
                }}
              >
                <span className="icon">
                  <img
                    src={iconFavorites}
                    alt="My favorites"
                    style={{ width: 16, height: 16 }}
                  />
                </span>
                <span>My favorites</span>
              </button>

              <button
                className={activeTab === 'reading' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('reading')
                  setSelectedBook(null)
                  setShowGenreDropdown(false)
                }}
              >
                <span className="icon">
                  <img
                    src={iconReading}
                    alt="Reading now"
                    style={{ width: 16, height: 16 }}
                  />
                </span>
                <span>Reading now</span>
              </button>

              <button
                className={activeTab === 'to_read' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('to_read')
                  setSelectedBook(null)
                  setShowGenreDropdown(false)
                }}
              >
                <span className="icon">
                  <img
                    src={iconToRead}
                    alt="To read"
                    style={{ width: 16, height: 16 }}
                  />
                </span>
                <span>To read</span>
              </button>
            </div>
          </div>

          <div>
            <div className="sidebar-section-title">Filters</div>
            <div className="sidebar-nav">
              <button
                className={activeTab === 'top_rated' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('top_rated')
                  setSelectedBook(null)
                  setShowGenreDropdown(false)
                }}
              >
                <span className="icon">
                  <img
                    src={iconTopRated}
                    alt="Top rated"
                    style={{ width: 16, height: 16 }}
                  />
                </span>
                <span>Top rated</span>
              </button>

              <button
                className={activeTab === 'new_arrivals' ? 'active' : ''}
                onClick={() => {
                  setActiveTab('new_arrivals')
                  setSelectedBook(null)
                  setShowGenreDropdown(false)
                }}
              >
                <span className="icon">
                  <img
                    src={iconNew}
                    alt="New arrivals"
                    style={{ width: 16, height: 16 }}
                  />
                </span>
                <span>New arrivals</span>
              </button>

              <div style={{ width: '100%' }}>
                <button
                  className={activeTab === 'by_genre' ? 'active' : ''}
                  onClick={() => {
                    setActiveTab('by_genre')
                    setSelectedBook(null)
                    setShowGenreDropdown((v) => !v)
                  }}
                >
                  <span className="icon">
                    <img
                      src={iconGenre}
                      alt="By genre"
                      style={{ width: 16, height: 16 }}
                    />
                  </span>
                  <span>By genre</span>
                </button>

                {activeTab === 'by_genre' && showGenreDropdown && (
                  <div className="genre-dropdown">
                    <button
                      className={!selectedGenreId ? 'genre-item active' : 'genre-item'}
                      onClick={() => setSelectedGenreId(null)}
                    >
                      All genres
                    </button>
                    {genres.map((g) => (
                      <button
                        key={g.id}
                        className={
                          selectedGenreId === g.id ? 'genre-item active' : 'genre-item'
                        }
                        onClick={() => setSelectedGenreId(g.id)}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          {/* LOGIN PANEL */}
          {showLogin && !isLoggedIn && (
            <div className="empty-state" style={{ marginTop: 10, maxWidth: 360 }}>
              <b>Sign in</b>
              <form
                onSubmit={handleLogin}
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                  }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                  }}
                />
                <button type="submit" className="btn-primary">
                  Log in
                </button>
              </form>
            </div>
          )}

          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-search">
              <span className="topbar-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by title, author, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="topbar-user">
              {isLoggedIn ? (
                <>
                  <span className="badge-pill">Signed in as {username}</span>
                  <button className="btn-outline" onClick={handleLogout}>
                    Log out
                  </button>
                  <div className="topbar-avatar" />
                </>
              ) : (
                <>
                  <span className="badge-pill">Guest mode</span>
                  <button
                    className="btn-primary"
                    onClick={() => setShowLogin((v) => !v)}
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>

          {/* HEADER */}
          <div className="section-header">
            <div className="section-title">
              <h1>{sectionTitle}</h1>
              <span>
                {selectedBook
                  ? 'See description and reviews for this book'
                  : loading
                  ? 'Loading your library…'
                  : visibleCount === 0
                  ? activeTab === 'favorites'
                    ? 'No favorite books yet.'
                    : 'No books match your query. Try another search.'
                  : activeTab === 'favorites'
                  ? `Showing ${visibleCount} favorite books`
                  : `Showing ${visibleCount} of ${books.length} books`}
              </span>
            </div>

            {selectedBook && (
              <div
                className="book-details-actions"
                style={{ marginTop: 12, display: 'flex', gap: 8 }}
              >
                <button className="btn-small" onClick={closeBookDetails}>
                  ← Back to list
                </button>
                <button
                  className="btn-small"
                  onClick={() => handleToggleReadingNow(selectedBook.id)}
                >
                  {userBookMap[selectedBook.id]?.status === 'READING'
                    ? '✓ Reading now (click to remove)'
                    : '▶ Mark as Reading now'}
                </button>
              </div>
            )}
          </div>

          {/* CONTENT */}
          {selectedBook ? (
            // ---------- ДЕТАЛИ КНИГИ ----------
            <div className="book-detail">
              <div className="book-detail-header">
                <div className="book-cover" style={{ maxWidth: 220 }}>
                  {selectedBook.cover_url ? (
                    <img src={selectedBook.cover_url} alt={selectedBook.title} />
                  ) : (
                    <>no cover</>
                  )}
                </div>

                <div className="book-meta">
                  <div
                    className="book-title"
                    style={{ fontSize: 24, marginBottom: 8 }}
                  >
                    {selectedBook.title}
                  </div>
                  <div className="book-sub">
                    {selectedBook.authors && selectedBook.authors.length > 0
                      ? selectedBook.authors.map((a) => a.name).join(', ')
                      : 'Unknown author'}
                  </div>
                  <div className="book-sub">
                    {selectedBook.year || 'Year unknown'}
                  </div>

                  {selectedBook.genres && selectedBook.genres.length > 0 && (
                    <div className="book-tags" style={{ marginTop: 8 }}>
                      {selectedBook.genres.map((g) => (
                        <span key={g.id} className="book-tag-pill">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedBook.description || 'No description yet.'}
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    <button
                      className="btn-small"
                      onClick={() => handleToggleFavorite(selectedBook.id)}
                    >
                      {favoriteBookIds.has(selectedBook.id)
                        ? '★ In favorites'
                        : '☆ Add to favorites'}
                    </button>

                    <button
                      className="btn-small"
                      onClick={() => handleAddReview(selectedBook.id)}
                    >
                      Add review
                    </button>
                  </div>
                </div>
              </div>

              <div className="book-detail-reviews" style={{ marginTop: 32 }}>
                <h2 style={{ fontSize: 18, marginBottom: 12 }}>Reviews</h2>

                {reviewsLoading ? (
                  <div className="empty-state">Loading reviews…</div>
                ) : bookReviews.length === 0 ? (
                  <div className="empty-state">
                    No reviews yet. Be the first to write one!
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      {(() => {
                        const avg =
                          bookReviews.reduce(
                            (sum, r) => sum + r.rating,
                            0
                          ) / bookReviews.length
                        return (
                          <span>
                            Average rating: <b>{avg.toFixed(1)}</b> / 5 (
                            {bookReviews.length} reviews)
                          </span>
                        )
                      })()}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {bookReviews.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            padding: 10,
                            borderRadius: 8,
                            background: '#020617',
                            border: '1px solid #1f2937',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: 4,
                            }}
                          >
                            <span>⭐ {r.rating} / 5</span>
                            <span
                              style={{
                                fontSize: 12,
                                opacity: 0.7,
                              }}
                            >
                              {r.user || 'Unknown user'}
                            </span>
                          </div>
                          {r.text && (
                            <div
                              style={{
                                fontSize: 14,
                                opacity: 0.9,
                              }}
                            >
                              {r.text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="empty-state">
              <b>Fetching catalog…</b>
            </div>
          ) : visibleBooks.length === 0 ? (
            <div className="empty-state">
              <b>No books found.</b>
            </div>
          ) : (
            // ---------- СПИСОК КНИГ ----------
            <div className="book-grid">
              {visibleBooks.map((book) => (
                <article key={book.id} className="book-card">
                  <div className="book-cover">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} />
                    ) : (
                      <>no cover</>
                    )}
                  </div>

                  <div
                    className="book-meta"
                    onClick={() => openBookDetails(book)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="book-title-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <span className="book-title">{book.title}</span>
                      <button
                        className="icon-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleToRead(book.id)
                        }}
                        title={
                          userBookMap[book.id]?.status === 'TO_READ'
                            ? 'Remove from To Read'
                            : 'Add to To Read'
                        }
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          opacity:
                            userBookMap[book.id]?.status === 'TO_READ' ? 1 : 0.6,
                        }}
                      >
                        <img
                          src={iconToRead}
                          alt="To Read"
                          style={{ width: 18, height: 18 }}
                        />
                      </button>
                    </div>

                    <div className="book-sub">
                      {book.authors && book.authors.length > 0
                        ? book.authors.map((a) => a.name).join(', ')
                        : 'Unknown author'}
                    </div>
                    <div className="book-sub">
                      {book.year || 'Year unknown'}
                    </div>

                    {book.genres && book.genres.length > 0 && (
                      <div className="book-tags">
                        {book.genres.map((g) => (
                          <span key={g.id} className="book-tag-pill">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="book-actions">
                    <button
                      className="btn-small"
                      onClick={() => handleToggleFavorite(book.id)}
                    >
                      {favoriteBookIds.has(book.id)
                        ? '★ In favorites'
                        : '☆ Add to favorites'}
                    </button>

                    <button
                      className="btn-small"
                      onClick={() => handleAddReview(book.id)}
                      style={{ marginLeft: 6 }}
                    >
                      Add review
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App