import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import {
  getBooks, createBook, updateBook, deleteBook, getCategories,
} from '../api/services'

const emptyForm = {
  title: '', author: '', isbn: '', publisher: '', publishedYear: '',
  categoryId: '', totalCopies: 1, coverImageUrl: '',
}

export default function Books() {
  const { isAdmin } = useAuth()
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(8)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadBooks = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getBooks({
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        page, pageSize,
      })
      setBooks(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError('Failed to load books.')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, page, pageSize])

  useEffect(() => { loadBooks() }, [loadBooks])

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data)).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (book) => {
    setEditingId(book.id)
    setForm({
      title: book.title, author: book.author, isbn: book.isbn,
      publisher: book.publisher || '', publishedYear: book.publishedYear || '',
      categoryId: book.categoryId, totalCopies: book.totalCopies,
      coverImageUrl: book.coverImageUrl || '',
    })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      publisher: form.publisher || null,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      categoryId: Number(form.categoryId),
      totalCopies: Number(form.totalCopies),
      coverImageUrl: form.coverImageUrl || null,
    }
    try {
      if (editingId) {
        await updateBook(editingId, payload)
      } else {
        await createBook(payload)
      }
      setModalOpen(false)
      loadBooks()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this book.')
    }
  }

  const handleDelete = async (book) => {
    if (!window.confirm(`Remove "${book.title}" from the catalog?`)) return
    try {
      await deleteBook(book.id)
      loadBooks()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this book.')
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Catalog</h1>
          <p className="page-subtitle">Book inventory across every category.</p>
        </div>
        {isAdmin === false ? null : null}
        <button className="btn-primary" onClick={openCreate}>+ Add book</button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by title, author, or ISBN…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value) }}
        />
        <select value={categoryFilter} onChange={(e) => { setPage(1); setCategoryFilter(e.target.value) }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="empty-state">Loading catalog…</p>
      ) : books.length === 0 ? (
        <p className="empty-state">No books match this search. Try a different title, author, or ISBN.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td className="cell-title">{b.title}</td>
                <td>{b.author}</td>
                <td className="mono">{b.isbn}</td>
                <td>{b.categoryName}</td>
                <td>
                  <span className={b.availableCopies > 0 ? 'badge badge-ok' : 'badge badge-danger'}>
                    {b.availableCopies} / {b.totalCopies}
                  </span>
                </td>
                <td className="row-actions">
                  <button className="btn-ghost" onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn-ghost btn-danger" onClick={() => handleDelete(b)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalCount > pageSize && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Edit book' : 'Add a new book'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>Author
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
            </label>
            <label>ISBN
              <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
            </label>
            <label>Publisher
              <input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
            </label>
            <label>Published year
              <input type="number" value={form.publishedYear} onChange={(e) => setForm({ ...form, publishedYear: e.target.value })} />
            </label>
            <label>Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="" disabled>Select a category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Total copies
              <input type="number" min="0" value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} required />
            </label>
            <label>Cover image URL
              <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
            </label>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add book'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
