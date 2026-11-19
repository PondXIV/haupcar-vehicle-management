import { useEffect, useState } from 'react'
import './VehicleBrandsPage.css'

function VehicleBrandsPage({ token, onSignOut }) {
  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [brandName, setBrandName] = useState('')
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingBrandId, setDeletingBrandId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!successMessage) return undefined

    const timer = window.setTimeout(() => setSuccessMessage(''), 4000)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    const controller = new AbortController()

    async function loadBrands() {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await fetch('/api/vehicle-brands', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        const result = await response.json()

        if (response.status === 401) {
          onSignOut('Your session has expired. Please sign in again.')
          return
        }

        if (!response.ok || result.Status !== 200 || !Array.isArray(result.Data)) {
          setLoadError(result.Data?.error || 'Unable to load vehicle brands.')
          return
        }

        setBrands(result.Data)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setLoadError('Cannot reach the server. Check your connection and try again.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadBrands()
    return () => controller.abort()
  }, [onSignOut, token])

  function openCreateForm() {
    setEditingBrand(null)
    setBrandName('')
    setFormError('')
    setIsFormOpen(true)
  }

  function openEditForm(brand) {
    setEditingBrand(brand)
    setBrandName(brand.name)
    setFormError('')
    setIsFormOpen(true)
  }

  function closeForm() {
    if (isSaving) return
    setIsFormOpen(false)
    setFormError('')
  }

  async function handleSave(event) {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)

    const isEditing = Boolean(editingBrand)
    try {
      const response = await fetch(
        isEditing ? `/api/vehicle-brands/${editingBrand.id}` : '/api/vehicle-brands',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: brandName.trim() }),
        },
      )
      const result = await response.json()

      if (response.status === 401) {
        onSignOut('Your session has expired. Please sign in again.')
        return
      }

      if (!response.ok || result.Status !== (isEditing ? 200 : 201) || !result.Data?.id) {
        setFormError(result.Data?.error || 'Unable to save vehicle brand.')
        return
      }

      setBrands((current) => {
        const updated = isEditing
          ? current.map((brand) => (brand.id === result.Data.id ? result.Data : brand))
          : [...current, result.Data]
        return updated.sort((first, second) => first.name.localeCompare(second.name))
      })
      setIsFormOpen(false)
      setBrandName('')
      setEditingBrand(null)
      setSuccessMessage(isEditing ? 'Brand updated successfully.' : 'Brand added successfully.')
    } catch {
      setFormError('Cannot reach the server. Check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(brand) {
    setDeleteError('')
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/vehicle-brands/${brand.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()

      if (response.status === 401) {
        onSignOut('Your session has expired. Please sign in again.')
        return
      }

      if (!response.ok || result.Status !== 200) {
        setDeleteError(result.Data?.error || 'Unable to delete vehicle brand.')
        return
      }

      setBrands((current) => current.filter((item) => item.id !== brand.id))
      setDeletingBrandId(null)
      setSuccessMessage('Brand deleted successfully.')
    } catch {
      setDeleteError('Cannot reach the server. Check your connection and try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fleet-content brands-content">
      {successMessage && (
        <div className="brand-success-toast" role="status" aria-live="polite">
          <span className="brand-success-icon" aria-hidden="true">✓</span>
          <span>{successMessage}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setSuccessMessage('')}
            type="button"
          >
            ×
          </button>
        </div>
      )}
      <div className="fleet-heading-row">
        <div>
          <p className="fleet-eyebrow"><span /> FLEET MANAGEMENT</p>
          <h1>Vehicle brands</h1>
          <p className="fleet-subtitle">Add and manage the brands available for your fleet.</p>
        </div>
        <button className="create-vehicle-button" onClick={openCreateForm} type="button">
          <span aria-hidden="true">+</span> Add brand
        </button>
      </div>

      {deleteError && (
        <div className="brand-page-error" role="alert">
          <span className="message-symbol">!</span>
          <span>{deleteError}</span>
          <button aria-label="Dismiss error" onClick={() => setDeleteError('')} type="button">×</button>
        </div>
      )}

      <section className="vehicles-card brands-card" aria-labelledby="brands-title">
        <div className="table-card-heading">
          <div className="table-title">
            <div>
              <h2 id="brands-title">All brands</h2>
              <p>Brands can’t be deleted while vehicles are assigned to them.</p>
            </div>
            <span className="result-count">{isLoading ? 'Loading' : `${brands.length} records`}</span>
          </div>
        </div>

        {loadError ? (
          <div className="table-message table-error" role="alert">
            <span className="message-symbol">!</span>
            <div><strong>Couldn&apos;t load brands</strong><p>{loadError}</p></div>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="vehicle-table brand-table">
              <thead>
                <tr>
                  <th scope="col">BRAND</th>
                  <th scope="col">ID</th>
                  <th scope="col">CREATED</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }, (_, index) => (
                    <tr className="skeleton-row" key={`brand-skeleton-${index}`}>
                      <td><span className="skeleton text-skeleton" /></td>
                      <td><span className="skeleton text-skeleton" /></td>
                      <td><span className="skeleton text-skeleton" /></td>
                      <td><span className="skeleton text-skeleton" /></td>
                    </tr>
                  ))
                ) : brands.length ? (
                  brands.map((brand) => (
                    <tr key={brand.id}>
                      <td>
                        <div className="brand-name-cell">
                          <span className="brand-initial" aria-hidden="true">
                            {brand.name.slice(0, 1).toUpperCase()}
                          </span>
                          <strong>{brand.name}</strong>
                        </div>
                      </td>
                      <td><span className="brand-id">#{brand.id}</span></td>
                      <td>
                        <span className="updated-value">
                          {brand.created_at
                            ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(brand.created_at))
                            : '—'}
                        </span>
                      </td>
                      <td className="brand-actions-cell">
                        {deletingBrandId === brand.id ? (
                          <div className="brand-delete-confirm">
                            <span>Delete this brand?</span>
                            <button
                              className="brand-delete-confirm-button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(brand)}
                              type="button"
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              className="brand-cancel-button"
                              disabled={isDeleting}
                              onClick={() => setDeletingBrandId(null)}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="brand-row-actions">
                            <button
                              aria-label={`Edit ${brand.name}`}
                              className="brand-edit-button"
                              onClick={() => openEditForm(brand)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              aria-label={`Delete ${brand.name}`}
                              className="brand-remove-button"
                              onClick={() => {
                                setDeleteError('')
                                setDeletingBrandId(brand.id)
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="empty-cell" colSpan="4">
                      <div className="empty-state">
                        <div className="empty-icon" aria-hidden="true">⌕</div>
                        <strong>No brands yet</strong>
                        <span>Add a brand to make it available when creating vehicles.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <div
          className="create-vehicle-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <section
            aria-labelledby="brand-form-title"
            aria-modal="true"
            className="create-vehicle-dialog brand-form-dialog"
            role="dialog"
          >
            <div className="create-vehicle-heading">
              <div>
                <p className="fleet-eyebrow"><span /> FLEET MANAGEMENT</p>
                <h2 id="brand-form-title">{editingBrand ? 'Edit brand' : 'Add a brand'}</h2>
                <p>{editingBrand ? 'Update the vehicle brand name.' : 'Register a brand for your fleet vehicles.'}</p>
              </div>
              <button
                aria-label="Close form"
                className="modal-close-button"
                disabled={isSaving}
                onClick={closeForm}
                type="button"
              >
                ×
              </button>
            </div>
            <form className="brand-form" onSubmit={handleSave}>
              <label htmlFor="brand-name">Brand name</label>
              <input
                autoFocus
                id="brand-name"
                maxLength={100}
                onChange={(event) => setBrandName(event.target.value)}
                placeholder="e.g. Toyota"
                required
                value={brandName}
              />
              {formError && <p className="create-form-error" role="alert">{formError}</p>}
              <div className="create-vehicle-actions">
                <button
                  className="cancel-create-button"
                  disabled={isSaving}
                  onClick={closeForm}
                  type="button"
                >
                  Cancel
                </button>
                <button className="submit-create-button" disabled={isSaving} type="submit">
                  {isSaving ? 'Saving...' : editingBrand ? 'Save changes' : 'Add brand'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default VehicleBrandsPage
