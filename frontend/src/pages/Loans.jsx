import React, { useEffect, useState, useCallback } from 'react'
import Modal from '../components/Modal'
import { getLoans, checkoutBook, returnBook, getBooks, getBorrowers } from '../api/services'

export default function Loans() {
  const [loans, setLoans] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [books, setBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [form, setForm] = useState({ bookId: '', borrowerId: '', loanDurationDays: 14 })
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getLoans({ status: statusFilter || undefined })
      setLoans(data)
    } catch (err) {
      setError('Failed to load circulation records.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const openCheckout = async () => {
    setFormError('')
    setForm({ bookId: '', borrowerId: '', loanDurationDays: 14 })
    setCheckoutOpen(true)
    try {
      const [booksRes, borrowersRes] = await Promise.all([
        getBooks({ page: 1, pageSize: 500 }),
        getBorrowers(),
      ])
      setBooks(booksRes.data.items.filter((b) => b.availableCopies > 0))
      setBorrowers(borrowersRes.data.filter((b) => b.isActive))
    } catch (err) {
      setFormError('Could not load books and borrowers.')
    }
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setFormError('')
    try {
      await checkoutBook({
        bookId: Number(form.bookId),
        borrowerId: Number(form.borrowerId),
        loanDurationDays: Number(form.loanDurationDays),
      })
      setCheckoutOpen(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not check out this book.')
    }
  }

  const handleReturn = async (loan) => {
    if (!window.confirm(`Mark "${loan.bookTitle}" as returned by ${loan.borrowerName}?`)) return
    try {
      await returnBook(loan.id)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not process this return.')
    }
  }

  const statusBadge = (loan) => {
    const isLate = loan.status !== 'Returned' && new Date(loan.dueDate) < new Date()
    if (loan.status === 'Returned') return <span className="badge badge-muted">Returned</span>
    if (isLate) return <span className="badge badge-danger">Overdue</span>
    return <span className="badge badge-ok">Active</span>
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Circulation</h1>
          <p className="page-subtitle">Check books in and out, and track what's due.</p>
        </div>
        <button className="btn-primary" onClick={openCheckout}>+ Check out a book</button>
      </div>

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Overdue">Overdue</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {loading ? (
        <p className="empty-state">Loading circulation records…</p>
      ) : loans.length === 0 ? (
        <p className="empty-state">No loans match this filter yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Borrower</th>
              <th>Loan date</th>
              <th>Due date</th>
              <th>Status</th>
              <th>Fine</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id}>
                <td className="cell-title">{l.bookTitle}</td>
                <td>{l.borrowerName}</td>
                <td>{new Date(l.loanDate).toLocaleDateString()}</td>
                <td>{new Date(l.dueDate).toLocaleDateString()}</td>
                <td>{statusBadge(l)}</td>
                <td>{l.fineAmount > 0 ? `$${l.fineAmount.toFixed(2)}` : '—'}</td>
                <td className="row-actions">
                  {l.status !== 'Returned' && (
                    <button className="btn-ghost" onClick={() => handleReturn(l)}>Mark returned</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {checkoutOpen && (
        <Modal title="Check out a book" onClose={() => setCheckoutOpen(false)}>
          <form onSubmit={handleCheckout} className="form-grid">
            <label>Book
              <select value={form.bookId} onChange={(e) => setForm({ ...form, bookId: e.target.value })} required>
                <option value="" disabled>Select an available book</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.availableCopies} available)</option>
                ))}
              </select>
            </label>
            <label>Borrower
              <select value={form.borrowerId} onChange={(e) => setForm({ ...form, borrowerId: e.target.value })} required>
                <option value="" disabled>Select a borrower</option>
                {borrowers.map((b) => (
                  <option key={b.id} value={b.id}>{b.fullName} ({b.email})</option>
                ))}
              </select>
            </label>
            <label>Loan duration (days)
              <input type="number" min="1" value={form.loanDurationDays} onChange={(e) => setForm({ ...form, loanDurationDays: e.target.value })} />
            </label>

            {formError && <div className="form-error">{formError}</div>}

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setCheckoutOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Check out</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
