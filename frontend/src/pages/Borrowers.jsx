import React, { useEffect, useState, useCallback } from 'react'
import Modal from '../components/Modal'
import {
  getBorrowers, createBorrower, updateBorrower, deleteBorrower,
} from '../api/services'

const emptyForm = { fullName: '', email: '', phone: '', address: '', isActive: true }

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getBorrowers({ search: search || undefined })
      setBorrowers(data)
    } catch (err) {
      setError('Failed to load borrowers.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (b) => {
    setEditingId(b.id)
    setForm({ fullName: b.fullName, email: b.email, phone: b.phone || '', address: b.address || '', isActive: b.isActive })
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingId) {
        await updateBorrower(editingId, form)
      } else {
        const { isActive, ...createPayload } = form
        await createBorrower(createPayload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this borrower.')
    }
  }

  const handleDelete = async (b) => {
    if (!window.confirm(`Remove borrower "${b.fullName}"?`)) return
    try {
      await deleteBorrower(b.id)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this borrower.')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Borrowers</h1>
          <p className="page-subtitle">Everyone registered to borrow from the library.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Add borrower</button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="empty-state">Loading borrowers…</p>
      ) : borrowers.length === 0 ? (
        <p className="empty-state">No borrowers found. Add the first one to get started.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Active loans</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((b) => (
              <tr key={b.id}>
                <td className="cell-title">{b.fullName}</td>
                <td>{b.email}</td>
                <td>{b.phone || '—'}</td>
                <td>{b.activeLoanCount}</td>
                <td>
                  <span className={b.isActive ? 'badge badge-ok' : 'badge badge-muted'}>
                    {b.isActive ? 'Active' : 'Inactive'}
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

      {modalOpen && (
        <Modal title={editingId ? 'Edit borrower' : 'Add a new borrower'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="form-grid">
            <label>Full name
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </label>
            <label>Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>Address
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            {editingId && (
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Membership active
              </label>
            )}

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add borrower'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
