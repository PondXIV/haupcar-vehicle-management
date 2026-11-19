import { useEffect, useState } from 'react'
import BrandMark from './BrandMark'
import VehicleBrandsPage from './VehicleBrandsPage'
import './VehicleDashboard.css'

const CURRENT_YEAR = new Date().getFullYear()

function VehicleDashboard({ session, onSignOut }) {
  const [activePage, setActivePage] = useState('vehicles')
  const [vehicles, setVehicles] = useState([])
  const [search, setSearch] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [brands, setBrands] = useState([])
  const [isBrandsLoading, setIsBrandsLoading] = useState(false)
  const [brandsError, setBrandsError] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [vehicleSuccessMessage, setVehicleSuccessMessage] = useState('')
  const [vehicleToDelete, setVehicleToDelete] = useState(null)
  const [deleteVehicleError, setDeleteVehicleError] = useState('')
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: '',
    brandId: '',
    model: '',
    vehicleType: 'Gasoline',
    notes: '',
  })
  const [page, setPage] = useState(1)
  const pageSize = 8

  useEffect(() => {
    if (!vehicleSuccessMessage) return undefined

    const timer = window.setTimeout(() => setVehicleSuccessMessage(''), 4000)
    return () => window.clearTimeout(timer)
  }, [vehicleSuccessMessage])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setIsLoading(true)
      setError('')
      setPage(1)

      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (vehicleType) params.set('vehicleType', vehicleType)

      try {
        const query = params.toString()
        const response = await fetch(`/api/vehicles${query ? `?${query}` : ''}`, {
          headers: { Authorization: `Bearer ${session.token}` },
          signal: controller.signal,
        })
        const result = await response.json()

        if (response.status === 401) {
          onSignOut('Your session has expired. Please sign in again.')
          return
        }

        if (!response.ok || result.Status !== 200 || !Array.isArray(result.Data)) {
          setError(result.Data?.error || 'Unable to load vehicles. Please try again.')
          return
        }

        setVehicles(result.Data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError('Cannot reach the server. Check your connection and try again.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 250)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [onSignOut, refreshKey, search, session.token, vehicleType])

  useEffect(() => {
    if (!isCreateOpen) return undefined

    const controller = new AbortController()
    async function loadBrands() {
      setIsBrandsLoading(true)
      setBrandsError('')

      try {
        const response = await fetch('/api/vehicle-brands', {
          headers: { Authorization: 'Bearer ' + session.token },
          signal: controller.signal,
        })
        const result = await response.json()

        if (response.status === 401) {
          onSignOut('Your session has expired. Please sign in again.')
          return
        }

        if (!response.ok || result.Status !== 200 || !Array.isArray(result.Data)) {
          setBrandsError(result.Data?.error || 'Unable to load vehicle brands.')
          return
        }

        setBrands(result.Data)
        setNewVehicle((current) => ({
          ...current,
          brandId: current.brandId || result.Data[0]?.id || '',
        }))
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setBrandsError('Cannot reach the server. Check your connection and try again.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsBrandsLoading(false)
        }
      }
    }

    loadBrands()
    return () => controller.abort()
  }, [isCreateOpen, onSignOut, session.token])

  function closeCreateForm() {
    if (isCreating) return
    setIsCreateOpen(false)
    setCreateError('')
  }

  async function handleCreateVehicle(event) {
    event.preventDefault()
    setCreateError('')
    setIsCreating(true)

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + session.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newVehicle,
          brandId: newVehicle.brandId,
          notes: newVehicle.notes.trim() || null,
        }),
      })
      const result = await response.json()

      if (response.status === 401) {
        onSignOut('Your session has expired. Please sign in again.')
        return
      }

      if (!response.ok || result.Status !== 201 || !result.Data?.id) {
        setCreateError(result.Data?.error || 'Unable to create vehicle. Please try again.')
        return
      }

      setIsCreateOpen(false)
      setNewVehicle({
        licensePlate: '',
        brandId: newVehicle.brandId,
        model: '',
        vehicleType: 'Gasoline',
        notes: '',
      })
      setSearch('')
      setVehicleType('')
      setRefreshKey((current) => current + 1)
      setVehicleSuccessMessage('Vehicle added successfully.')
    } catch {
      setCreateError('Cannot reach the server. Check your connection and try again.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteVehicle() {
    if (!vehicleToDelete) return

    setDeleteVehicleError('')
    setIsDeletingVehicle(true)

    try {
      const response = await fetch(`/api/vehicles/${vehicleToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + session.token },
      })
      const result = await response.json()

      if (response.status === 401) {
        onSignOut('Your session has expired. Please sign in again.')
        return
      }

      if (!response.ok || result.Status !== 200) {
        setDeleteVehicleError(result.Data?.error || 'Unable to delete vehicle. Please try again.')
        return
      }

      const remainingVehicles = vehicles.filter((vehicle) => vehicle.id !== vehicleToDelete.id)
      const remainingPages = Math.max(1, Math.ceil(remainingVehicles.length / pageSize))
      setVehicles(remainingVehicles)
      setPage((currentPage) => Math.min(currentPage, remainingPages))
      setVehicleToDelete(null)
      setVehicleSuccessMessage('Vehicle deleted successfully.')
    } catch {
      setDeleteVehicleError('Cannot reach the server. Check your connection and try again.')
    } finally {
      setIsDeletingVehicle(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(vehicles.length / pageSize))
  const pageVehicles = vehicles.slice((page - 1) * pageSize, page * pageSize)
  const vehicleCount = vehicles.length
  const electricCount = vehicles.filter((vehicle) => vehicle.vehicle_type === 'Electric').length
  const gasolineCount = vehicles.filter((vehicle) => vehicle.vehicle_type === 'Gasoline').length

  return (
    <main className="fleet-app">
      <aside className="fleet-sidebar">
        <a className="brand fleet-brand" href="/" aria-label="Haupcar dashboard">
          <BrandMark />
          <span>HAUP<span className="brand-light">CAR</span></span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>
        <nav className="fleet-nav" aria-label="Main navigation">
          <button
            aria-current={activePage === 'vehicles' ? 'page' : undefined}
            className={`fleet-nav-link ${activePage === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActivePage('vehicles')}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 13h18l-1.6-5a2 2 0 0 0-1.9-1.4H6.5A2 2 0 0 0 4.6 8L3 13Zm0 0v5h18v-5M6 18v2m12-2v2M6.5 15.5h.01m11-.01h.01" />
            </svg>
            Vehicles
            <span className="nav-count">{vehicleCount}</span>
          </button>
          <button
            aria-current={activePage === 'brands' ? 'page' : undefined}
            className={`fleet-nav-link ${activePage === 'brands' ? 'active' : ''}`}
            onClick={() => setActivePage('brands')}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5.5h16M4 12h16M4 18.5h16M7 5.5h.01M7 12h.01M7 18.5h.01" />
            </svg>
            Brands
          </button>
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-help">
          <div className="help-icon">?</div>
          <div>
            <strong>Need a hand?</strong>
            <span>Your fleet is in good hands.</span>
          </div>
        </div>
        <div className="sidebar-version">HAUPCAR FLEET <span>v1.0</span></div>
      </aside>

      <section className="fleet-main" id="vehicles">
        <header className="fleet-topbar">
          <div className="breadcrumb">
            <span>Workspace</span><b>/</b>{activePage === 'vehicles' ? 'Vehicles' : 'Brands'}
          </div>
          <div className="topbar-user">
            <span className="topbar-status"><i /> All systems operational</span>
            <span className="topbar-divider" />
            <div className="user-avatar" aria-hidden="true">
              {session.username.slice(0, 1).toUpperCase()}
            </div>
            <div className="user-info">
              <strong>{session.username}</strong>
              <span>Fleet manager</span>
            </div>
            <button className="logout-button" onClick={() => onSignOut()} type="button">
              Sign out
            </button>
          </div>
        </header>

        {activePage === 'vehicles' ? (
        <div className="fleet-content">
          {vehicleSuccessMessage && (
            <div className="vehicle-success-toast" role="status" aria-live="polite">
              <span className="vehicle-success-icon" aria-hidden="true">✓</span>
              <span>{vehicleSuccessMessage}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setVehicleSuccessMessage('')}
                type="button"
              >
                ×
              </button>
            </div>
          )}
          <div className="fleet-heading-row">
            <div>
              <p className="fleet-eyebrow"><span /> FLEET OVERVIEW</p>
              <h1>Vehicles</h1>
              <p className="fleet-subtitle">A clear view of every vehicle in your fleet.</p>
            </div>
            <div className="fleet-heading-actions">
              <div className="updated-label">
                <span className="updated-dot" />
                Live fleet data
              </div>
              <button
                className="create-vehicle-button"
                onClick={() => {
                  setCreateError('')
                  setIsCreateOpen(true)
                }}
                type="button"
              >
                <span aria-hidden="true">+</span> Add vehicle
              </button>
            </div>
          </div>

          <div className="fleet-stats">
            <article className="stat-card">
              <div className="stat-icon total-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 13h18l-1.6-5a2 2 0 0 0-1.9-1.4H6.5A2 2 0 0 0 4.6 8L3 13Zm0 0v5h18v-5M6 18v2m12-2v2" /></svg>
              </div>
              <div className="stat-copy"><span>Vehicles shown</span><strong>{isLoading ? '—' : vehicleCount}</strong></div>
              <span className="stat-tag">MATCHED</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon electric-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z" /></svg>
              </div>
              <div className="stat-copy"><span>Electric shown</span><strong>{isLoading ? '—' : electricCount}</strong></div>
              <span className="stat-tag green-tag">ELECTRIC</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon gasoline-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M4 21h13M8 7h5v5H8zM16 8h2l2 3v6a2 2 0 0 1-4 0v-4" /></svg>
              </div>
              <div className="stat-copy"><span>Gasoline shown</span><strong>{isLoading ? '—' : gasolineCount}</strong></div>
              <span className="stat-tag amber-tag">GASOLINE</span>
            </article>
          </div>

          <section className="vehicles-card" aria-labelledby="vehicles-title">
            <div className="table-card-heading">
              <div className="table-title">
                <div>
                  <h2 id="vehicles-title">All vehicles</h2>
                  <p>Manage and review your registered fleet.</p>
                </div>
                <span className="result-count">{isLoading ? 'Loading' : `${vehicleCount} records`}</span>
              </div>
              <div className="table-controls">
                <label className="vehicle-search">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                  <input
                    aria-label="Search vehicles"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search vehicles..."
                    type="search"
                    value={search}
                  />
                  <kbd>⌘ K</kbd>
                </label>
                <label className="type-filter">
                  <span className="sr-only">Filter by vehicle type</span>
                  <select onChange={(event) => setVehicleType(event.target.value)} value={vehicleType}>
                    <option value="">All types</option>
                    <option value="Electric">Electric</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>
              </div>
            </div>

            {error ? (
              <div className="table-message table-error" role="alert">
                <span className="message-symbol">!</span>
                <div><strong>Couldn&apos;t load the fleet</strong><p>{error}</p></div>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="vehicle-table">
                  <thead>
                    <tr>
                      <th scope="col">VEHICLE</th>
                      <th scope="col">LICENSE PLATE</th>
                      <th scope="col">TYPE</th>
                      <th scope="col">NOTES</th>
                      <th scope="col">LAST UPDATED</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 4 }, (_, index) => (
                        <tr className="skeleton-row" key={`skeleton-${index}`}>
                          <td><span className="skeleton vehicle-skeleton" /></td>
                          <td><span className="skeleton text-skeleton" /></td>
                          <td><span className="skeleton badge-skeleton" /></td>
                          <td><span className="skeleton text-skeleton" /></td>
                          <td><span className="skeleton text-skeleton" /></td>
                          <td><span className="skeleton text-skeleton" /></td>
                        </tr>
                      ))
                    ) : pageVehicles.length ? (
                      pageVehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>
                            <div className="vehicle-cell">
                              <div className="vehicle-thumbnail" aria-hidden="true">
                                <svg viewBox="0 0 32 32" fill="none">
                                  <path d="m5 19 2-5 3.8-4.6a2 2 0 0 1 1.5-.7h7.5a2 2 0 0 1 1.6.8L25 15l2 2v5H5v-3Zm3.2-5h15.2M9 22v2m14-2v2" />
                                  <circle cx="10" cy="20" r="1.5" /><circle cx="22" cy="20" r="1.5" />
                                </svg>
                              </div>
                              <div className="vehicle-name">
                                <strong>{vehicle.brand?.name || 'Unknown brand'} {vehicle.model}</strong>
                                <span>ID {vehicle.id}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="plate-value">{vehicle.license_plate}</span></td>
                          <td><span className={`type-badge ${vehicle.vehicle_type.toLowerCase()}`}>{vehicle.vehicle_type}</span></td>
                          <td><span className="notes-value">{vehicle.notes || '—'}</span></td>
                          <td>
                            <span className="updated-value">
                              {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(vehicle.updated_at))}
                            </span>
                          </td>
                          <td className="vehicle-actions-cell">
                            <button
                              aria-label={`Delete ${vehicle.brand?.name || ''} ${vehicle.model}, plate ${vehicle.license_plate}`}
                              className="vehicle-delete-button"
                              onClick={() => {
                                setDeleteVehicleError('')
                                setVehicleToDelete(vehicle)
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="empty-cell" colSpan="6">
                          <div className="empty-state">
                            <div className="empty-icon" aria-hidden="true">⌕</div>
                            <strong>No vehicles found</strong>
                            <span>Try changing your search or filter.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="table-footer">
              <span>
                Showing <strong>{vehicleCount ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, vehicleCount)}</strong> of <strong>{vehicleCount}</strong> vehicles
              </span>
              <div className="pagination">
                <button
                  aria-label="Previous page"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  type="button"
                >
                  ←
                </button>
                <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
                <button
                  aria-label="Next page"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  type="button"
                >
                  →
                </button>
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>© {CURRENT_YEAR} Haupcar Fleet Management</span>
            <span><i /> System operational</span>
          </footer>
        </div>
        ) : (
          <VehicleBrandsPage token={session.token} onSignOut={onSignOut} />
        )}
      </section>

      {isCreateOpen && (
        <div
          className="create-vehicle-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreateForm()
          }}
        >
          <section
            aria-labelledby="create-vehicle-title"
            aria-modal="true"
            className="create-vehicle-dialog"
            role="dialog"
          >
            <div className="create-vehicle-heading">
              <div>
                <p className="fleet-eyebrow"><span /> FLEET MANAGEMENT</p>
                <h2 id="create-vehicle-title">Add a vehicle</h2>
                <p>Enter the details to register a vehicle in your fleet.</p>
              </div>
              <button
                aria-label="Close form"
                className="modal-close-button"
                disabled={isCreating}
                onClick={closeCreateForm}
                type="button"
              >
                ×
              </button>
            </div>

            <form className="create-vehicle-form" onSubmit={handleCreateVehicle}>
              <label>
                License plate
                <input
                  autoComplete="off"
                  maxLength={20}
                  onChange={(event) => setNewVehicle((current) => ({
                    ...current,
                    licensePlate: event.target.value,
                  }))}
                  placeholder="e.g. NEW-123"
                  required
                  value={newVehicle.licensePlate}
                />
              </label>
              <label>
                Brand
                <select
                  disabled={isBrandsLoading || brands.length === 0}
                  onChange={(event) => setNewVehicle((current) => ({
                    ...current,
                    brandId: event.target.value,
                  }))}
                  required
                  value={newVehicle.brandId}
                >
                  <option value="">
                    {isBrandsLoading ? 'Loading brands...' : 'Select a brand'}
                  </option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                {brandsError && <span className="form-field-error">{brandsError}</span>}
                {!isBrandsLoading && !brandsError && brands.length === 0 && (
                  <span className="form-field-error">Create a vehicle brand before adding vehicles.</span>
                )}
              </label>
              <label>
                Model
                <input
                  maxLength={100}
                  onChange={(event) => setNewVehicle((current) => ({
                    ...current,
                    model: event.target.value,
                  }))}
                  placeholder="e.g. Corolla"
                  required
                  value={newVehicle.model}
                />
              </label>
              <label>
                Vehicle type
                <select
                  onChange={(event) => setNewVehicle((current) => ({
                    ...current,
                    vehicleType: event.target.value,
                  }))}
                  value={newVehicle.vehicleType}
                >
                  <option value="Gasoline">Gasoline</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </label>
              <label className="form-notes-field">
                Notes <span>(optional)</span>
                <textarea
                  onChange={(event) => setNewVehicle((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))}
                  placeholder="Add any useful details..."
                  rows={3}
                  value={newVehicle.notes}
                />
              </label>

              {createError && (
                <p className="create-form-error" role="alert">{createError}</p>
              )}

              <div className="create-vehicle-actions">
                <button
                  className="cancel-create-button"
                  disabled={isCreating}
                  onClick={closeCreateForm}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="submit-create-button"
                  disabled={isCreating || isBrandsLoading || brands.length === 0}
                  type="submit"
                >
                  {isCreating ? 'Saving...' : 'Save vehicle'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {vehicleToDelete && (
        <div
          className="create-vehicle-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeletingVehicle) {
              setVehicleToDelete(null)
              setDeleteVehicleError('')
            }
          }}
        >
          <section
            aria-labelledby="delete-vehicle-title"
            aria-modal="true"
            className="create-vehicle-dialog delete-vehicle-dialog"
            role="alertdialog"
          >
            <div className="create-vehicle-heading">
              <div>
                <p className="fleet-eyebrow"><span /> FLEET MANAGEMENT</p>
                <h2 id="delete-vehicle-title">Delete vehicle?</h2>
                <p>
                  This will permanently remove <strong>{vehicleToDelete.brand?.name} {vehicleToDelete.model}</strong>
                  {' '}({vehicleToDelete.license_plate}) from your fleet.
                </p>
              </div>
              <button
                aria-label="Close confirmation"
                className="modal-close-button"
                disabled={isDeletingVehicle}
                onClick={() => {
                  setVehicleToDelete(null)
                  setDeleteVehicleError('')
                }}
                type="button"
              >
                ×
              </button>
            </div>
            {deleteVehicleError && (
              <p className="create-form-error delete-vehicle-error" role="alert">
                {deleteVehicleError}
              </p>
            )}
            <div className="create-vehicle-actions">
              <button
                className="cancel-create-button"
                disabled={isDeletingVehicle}
                onClick={() => {
                  setVehicleToDelete(null)
                  setDeleteVehicleError('')
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="confirm-delete-vehicle-button"
                disabled={isDeletingVehicle}
                onClick={handleDeleteVehicle}
                type="button"
              >
                {isDeletingVehicle ? 'Deleting...' : 'Delete vehicle'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default VehicleDashboard
