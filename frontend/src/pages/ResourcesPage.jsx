import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { cloneMockData, mockNotifications, mockResources } from '../data/mockData'

const emptyForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: 1,
  location: '',
  status: 'ACTIVE',
  description: ''
}

function formatResourceTypeLabel(type) {
  return (type || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getLocationPlaceholder(type) {
  if (type === 'LECTURE_HALL' || type === 'LAB') {
    return 'Enter building or room location'
  }

  if (type === 'EQUIPMENT') {
    return 'Enter storage or assigned location'
  }

  return 'Enter location'
}

function getCapacityPlaceholder(type) {
  return type === 'EQUIPMENT'
    ? 'Enter item quantity'
    : 'Enter seating capacity'
}

function getDescriptionPreview(description) {
  if (!description) {
    return 'No description provided.'
  }

  if (description.length <= 120) {
    return description
  }

  return `${description.slice(0, 117)}...`
}

function toFormState(resource) {
  return {
    name: resource.name || '',
    type: resource.type || 'LECTURE_HALL',
    capacity: resource.capacity ?? 1,
    location: resource.location || '',
    status: resource.status || 'ACTIVE',
    description: resource.description || ''
  }
}

function validateResourceForm(form) {
  const errors = {}

  if (!form.name.trim()) {
    errors.name = 'Resource name is required.'
  }

  if (!form.type) {
    errors.type = 'Resource type is required.'
  }

  if (!String(form.capacity).trim()) {
    errors.capacity = 'Capacity or quantity is required.'
  } else if (Number(form.capacity) < 1 || Number.isNaN(Number(form.capacity))) {
    errors.capacity = 'Capacity or quantity must be at least 1.'
  }

  if (!form.location.trim()) {
    errors.location = 'Location is required.'
  }

  if (!form.status) {
    errors.status = 'Status is required.'
  }

  return errors
}

export default function ResourcesPage() {
  const [resources, setResources] = useState(() => cloneMockData(mockResources))
  const [notifications] = useState(() => cloneMockData(mockNotifications))
  const [form, setForm] = useState(emptyForm)
  const [editingResourceId, setEditingResourceId] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingResourceId, setDeletingResourceId] = useState(null)
  const { user } = useAuth()

  const resetFormState = () => {
    setForm(emptyForm)
    setEditingResourceId(null)
    setFieldErrors({})
  }

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }))

    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const startEdit = (resource) => {
    console.log('[resources] edit requested', { id: resource.id })
    setEditingResourceId(resource.id)
    setForm(toFormState(resource))
    setSubmitError('')
    setSubmitSuccess('')
    setFieldErrors({})
  }

  const cancelEdit = () => {
    console.log('[resources] edit cancelled', { id: editingResourceId })
    resetFormState()
    setSubmitError('')
    setSubmitSuccess('')
  }

  const saveResource = (e) => {
    e.preventDefault()
    const clientErrors = validateResourceForm(form)

    if (Object.keys(clientErrors).length > 0) {
      console.warn('[resources] client validation failed', clientErrors)
      setFieldErrors(clientErrors)
      setSubmitError('Please correct the highlighted fields before saving.')
      setSubmitSuccess('')
      return
    }

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      description: form.description.trim()
    }
    const isEditing = editingResourceId !== null

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    setFieldErrors({})

    if (isEditing) {
      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.id === editingResourceId ? { ...resource, ...payload } : resource
        )
      )
      setSubmitSuccess('Resource updated successfully.')
    } else {
      setResources((currentResources) => [
        ...currentResources,
        {
          id: Date.now(),
          ...payload
        }
      ])
      setSubmitSuccess('Resource created successfully.')
    }

    resetFormState()
    setIsSubmitting(false)
  }

  const deleteResource = (resource) => {
    const confirmed = window.confirm(`Delete "${resource.name}"?`)

    if (!confirmed) {
      return
    }

    setDeletingResourceId(resource.id)
    setSubmitError('')
    setSubmitSuccess('')

    setResources((currentResources) => currentResources.filter((currentResource) => currentResource.id !== resource.id))

    if (editingResourceId === resource.id) {
      resetFormState()
    }

    setSubmitSuccess('Resource deleted successfully.')
    setDeletingResourceId(null)
  }

  return (
    <Layout
      title="Resources"
      subtitle="Manage rooms, labs, and equipment as reusable campus assets."
      notifications={notifications}
    >
      <div className="resource-page-grid">
        <section className="panel resource-list-panel">
          <div className="resource-section-header">
            <div>
              <div className="resource-eyebrow">Catalog</div>
              <h3>Campus Resources</h3>
              <p>Static resource records for lecture halls, labs, and equipment.</p>
            </div>
            <div className="resource-count-pill">{resources.length} items</div>
          </div>

          {resources.length ? (
            <div className="resource-cards-grid">
              {resources.map((resource) => (
                <article key={resource.id} className="resource-card resource-card-polished">
                  <div className="row between gap wrap">
                    <div>
                      <strong className="resource-title">{resource.name}</strong>
                      <p className="resource-subtitle">{formatResourceTypeLabel(resource.type)}</p>
                    </div>
                    <div className={`badge ${resource.status === 'ACTIVE' ? 'success' : 'danger'}`}>{resource.status}</div>
                  </div>

                  <div className="resource-meta-grid">
                    <div className="resource-meta-item">
                      <span>Location</span>
                      <strong>{resource.location}</strong>
                    </div>
                    <div className="resource-meta-item">
                      <span>{resource.type === 'EQUIPMENT' ? 'Quantity' : 'Capacity'}</span>
                      <strong>{resource.capacity}</strong>
                    </div>
                  </div>

                  <p className="resource-detail">{getDescriptionPreview(resource.description)}</p>

                  {user?.role === 'ADMIN' && (
                    <div className="row gap wrap resource-actions">
                      <button
                        className="small-btn"
                        type="button"
                        onClick={() => startEdit(resource)}
                        disabled={isSubmitting || deletingResourceId === resource.id}
                      >
                        Edit
                      </button>
                      <button
                        className="small-btn danger-btn"
                        type="button"
                        onClick={() => deleteResource(resource)}
                        disabled={deletingResourceId === resource.id || isSubmitting}
                      >
                        {deletingResourceId === resource.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">No resources have been added yet. Create the first record from the form.</div>
          )}
        </section>

        {user?.role === 'ADMIN' && (
          <section className="panel colorful-3 resource-form-panel">
            <div className="resource-section-header">
              <div>
                <div className="resource-eyebrow">{editingResourceId ? 'Edit Mode' : 'Create Mode'}</div>
                <h3>{editingResourceId ? 'Update Resource' : 'Add Resource'}</h3>
                <p>Use one form for rooms, labs, and equipment without any booking or schedule fields.</p>
              </div>
            </div>

            {submitError && (
              <div className="error-box">
                <strong>{submitError}</strong>
                {Object.keys(fieldErrors).length > 0 && (
                  <div className="form-feedback-list">
                    {Object.entries(fieldErrors).map(([field, message]) => (
                      <div key={field}>{field}: {message}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form className="form-grid resource-form-grid" onSubmit={saveResource}>
              <div className="field-block">
                <label className="resource-field-label" htmlFor="resource-name">Resource Name</label>
                <input
                  id="resource-name"
                  placeholder="Enter resource name"
                  value={form.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                />
                {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
              </div>

              <div className="field-block">
                <label className="resource-field-label" htmlFor="resource-type">Resource Type</label>
                <select
                  id="resource-type"
                  value={form.type}
                  onChange={(e) => updateFormField('type', e.target.value)}
                >
                  <option>LECTURE_HALL</option>
                  <option>LAB</option>
                  <option>EQUIPMENT</option>
                </select>
                {fieldErrors.type && <div className="field-error">{fieldErrors.type}</div>}
              </div>

              <div className="field-block">
                <label className="resource-field-label" htmlFor="resource-capacity">Capacity / Quantity</label>
                <input
                  id="resource-capacity"
                  type="number"
                  min="1"
                  placeholder={getCapacityPlaceholder(form.type)}
                  value={form.capacity}
                  onChange={(e) => updateFormField('capacity', e.target.value)}
                />
                {fieldErrors.capacity && <div className="field-error">{fieldErrors.capacity}</div>}
              </div>

              <div className="field-block">
                <label className="resource-field-label" htmlFor="resource-location">Location</label>
                <input
                  id="resource-location"
                  placeholder={getLocationPlaceholder(form.type)}
                  value={form.location}
                  onChange={(e) => updateFormField('location', e.target.value)}
                />
                {fieldErrors.location && <div className="field-error">{fieldErrors.location}</div>}
              </div>

              <div className="field-block">
                <label className="resource-field-label" htmlFor="resource-status">Status</label>
                <select
                  id="resource-status"
                  value={form.status}
                  onChange={(e) => updateFormField('status', e.target.value)}
                >
                  <option>ACTIVE</option>
                  <option>OUT_OF_SERVICE</option>
                </select>
                {fieldErrors.status && <div className="field-error">{fieldErrors.status}</div>}
              </div>

              <div className="field-block">
                <label className="resource-field-label" htmlFor="resource-description">Description</label>
                <textarea
                  id="resource-description"
                  placeholder="Add a short note describing the resource, facilities, or usage"
                  value={form.description}
                  onChange={(e) => updateFormField('description', e.target.value)}
                />
                {fieldErrors.description && <div className="field-error">{fieldErrors.description}</div>}
              </div>

              <div className="row gap wrap">
                <button className="primary-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (editingResourceId ? 'Updating...' : 'Creating...') : (editingResourceId ? 'Update Resource' : 'Create Resource')}
                </button>
                {editingResourceId && (
                  <button className="small-btn" type="button" onClick={cancelEdit} disabled={isSubmitting}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        )}
      </div>
    </Layout>
  )
}
