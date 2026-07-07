import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBooks, getBorrowers, getLoans, getOverdueLoans } from '../api/services'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [overdue, setOverdue] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [booksRes, borrowersRes, loansRes, overdueRes] = await Promise.all([
          getBooks({ page: 1, pageSize: 1 }),
          getBorrowers(),
          getLoans({ status: 'Active' }),
          getOverdueLoans(),
        ])
        setStats({
          totalBooks: booksRes.data.totalCount,
          totalBorrowers: borrowersRes.data.length,
          activeLoans: loansRes.data.length,
          overdueCount: overdueRes.data.length,
        })
        setOverdue(overdueRes.data.slice(0, 5))
      } catch (err) {
        setError('Could not load dashboard data. Is the API running?')
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">A snapshot of today's circulation activity.</p>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {stats && (
        <div className="stat-grid">
          <Link to="/books" className="stat-card">
            <span className="stat-label">Titles in catalog</span>
            <span className="stat-value">{stats.totalBooks}</span>
          </Link>
          <Link to="/borrowers" className="stat-card">
            <span className="stat-label">Registered borrowers</span>
            <span className="stat-value">{stats.totalBorrowers}</span>
          </Link>
          <Link to="/loans" className="stat-card">
            <span className="stat-label">Active loans</span>
            <span className="stat-value">{stats.activeLoans}</span>
          </Link>
          <Link to="/loans" className="stat-card stat-card-warn">
            <span className="stat-label">Overdue</span>
            <span className="stat-value">{stats.overdueCount}</span>
          </Link>
        </div>
      )}

      <section className="panel">
        <div className="panel-header">
          <h2>Overdue right now</h2>
          <Link to="/loans" className="link-quiet">View all circulation →</Link>
        </div>

        {overdue.length === 0 ? (
          <p className="empty-state">Nothing overdue. Every book out is still within its due date.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Due date</th>
                <th>Days late</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((l) => {
                const daysLate = Math.floor((Date.now() - new Date(l.dueDate)) / 86400000)
                return (
                  <tr key={l.id}>
                    <td>{l.bookTitle}</td>
                    <td>{l.borrowerName}</td>
                    <td>{new Date(l.dueDate).toLocaleDateString()}</td>
                    <td><span className="badge badge-danger">{daysLate}d</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
