import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { cloneMockData, mockBookings, mockNotifications, mockResources } from '../data/mockData'

const BOOKING_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'HISTORY', label: 'History' }
]

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createInitialForm() {
  return {
    resourceId: '',
    bookingDate: getTodayKey(),
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1
  }
}

function toTitleCase(value) {
  return (value || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value) {
  if (!value) {
    return 'Date not set'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`))
}

function formatTimeRange(startTime, endTime) {
  const start = startTime ? startTime.slice(0, 5) : '--:--'
  const end = endTime ? endTime.slice(0, 5) : '--:--'
  return `${start} - ${end}`
}

function getStatusBadgeClass(status) {
  if (status === 'APPROVED') {
    return 'success'
  }

  if (status === 'REJECTED') {
    return 'danger'
  }

  if (status === 'CANCELLED') {
    return 'neutral'
  }

  return 'warning'
}

function validateBookingForm(form, selectedResource) {
  const errors = {}
  const attendeeCount = Number(form.expectedAttendees)

  if (!form.resourceId) {
    errors.resourceId = 'Select a resource to continue.'
  }

  if (!form.bookingDate) {
    errors.bookingDate = 'Booking date is required.'
  } else if (form.bookingDate < getTodayKey()) {
    errors.bookingDate = 'Booking date cannot be in the past.'
  }

  if (!form.startTime) {
    errors.startTime = 'Start time is required.'
  }

  if (!form.endTime) {
    errors.endTime = 'End time is required.'
  } else if (form.startTime && form.endTime <= form.startTime) {
    errors.endTime = 'End time must be later than start time.'
  }

  if (!form.purpose.trim()) {
    errors.purpose = 'Purpose is required.'
  }

  if (!String(form.expectedAttendees).trim()) {
    errors.expectedAttendees = 'Expected attendees is required.'
  } else if (Number.isNaN(attendeeCount) || attendeeCount < 1) {
    errors.expectedAttendees = 'Expected attendees must be at least 1.'
  }

  if (selectedResource?.status === 'OUT_OF_SERVICE') {
    errors.resourceId = 'Selected resource is out of service.'
  }

  if (selectedResource && !Number.isNaN(attendeeCount) && attendeeCount > selectedResource.capacity) {
    errors.expectedAttendees = `Expected attendees cannot exceed ${selectedResource.capacity} for this resource.`
  }

  return errors
}

function getEmptyStateCopy(selectedTab) {
  if (selectedTab === 'ACTIVE') {
    return {
      title: 'No active bookings yet',
      detail: 'Pending and approved bookings will appear here once requests are submitted.'
    }
  }

  if (selectedTab === 'HISTORY') {
    return {
      title: 'No booking history yet',
      detail: 'Rejected and cancelled bookings will appear here after decisions are made.'
    }
  }

  return {
    title: 'No bookings found',
    detail: 'Create the first booking request from the form on the left.'
  }
}

export default function BookingsPage() {
  const [resources] = useState(() => cloneMockData(mockResources))
  const [bookings, setBookings] = useState(() => cloneMockData(mockBookings))
  const [notifications] = useState(() => cloneMockData(mockNotifications))
  const [form, setForm] = useState(() => createInitialForm())
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState('ACTIVE')
  const [activeActionId, setActiveActionId] = useState(null)
  const [activeActionType, setActiveActionType] = useState('')
  const { user } = useAuth()

  const selectedResource = resources.find((resource) => String(resource.id) === String(form.resourceId)) || null
  const liveErrors = validateBookingForm(form, selectedResource)

  const displayErrors = {
    resourceId: fieldErrors.resourceId || (selectedResource?.status === 'OUT_OF_SERVICE' ? liveErrors.resourceId : ''),
    bookingDate: fieldErrors.bookingDate || (form.bookingDate ? liveErrors.bookingDate : ''),
    startTime: fieldErrors.startTime,
    endTime: fieldErrors.endTime || (form.startTime && form.endTime ? liveErrors.endTime : ''),
    purpose: fieldErrors.purpose || (form.purpose && !form.purpose.trim() ? liveErrors.purpose : ''),
    expectedAttendees:
      fieldErrors.expectedAttendees ||
      (String(form.expectedAttendees).trim() ? liveErrors.expectedAttendees : '')
  }

  const canSubmit = resources.length > 0 && Object.keys(liveErrors).length === 0 && !isSubmitting

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }))

    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]

      if (field === 'resourceId') {
        delete nextErrors.expectedAttendees
      }

      if (field === 'startTime' || field === 'endTime') {
        delete nextErrors.startTime
        delete nextErrors.endTime
      }

      return nextErrors
    })
  }

  const createBooking = (e) => {
    e.preventDefault()

    if (Object.keys(liveErrors).length > 0) {
      setFieldErrors(liveErrors)
      setSubmitError('Please correct the highlighted booking details before submitting.')
      setSubmitSuccess('')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    setFieldErrors({})

    setBookings((currentBookings) => [
      ...currentBookings,
      {
        id: Date.now(),
        resourceId: selectedResource.id,
        resource: selectedResource,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose.trim(),
        expectedAttendees: Number(form.expectedAttendees),
        status: 'PENDING'
      }
    ])
    setSubmitSuccess('Booking request submitted successfully.')
    setForm(createInitialForm())
    setIsSubmitting(false)
  }

  const runBookingAction = (booking, action) => {
    setActiveActionId(booking.id)
    setActiveActionType(action)
    setSubmitError('')
    setSubmitSuccess('')
    setFieldErrors({})

    setBookings((currentBookings) =>
      currentBookings.map((currentBooking) =>
        currentBooking.id === booking.id ? { ...currentBooking, status: action } : currentBooking
      )
    )
    setSubmitSuccess(`Booking ${action === 'APPROVED' ? 'approved' : action === 'REJECTED' ? 'rejected' : 'cancelled'} successfully.`)
    setActiveActionId(null)
    setActiveActionType('')
  }

  const tabCounts = {
    ALL: bookings.length,
    ACTIVE: bookings.filter((booking) => booking.status === 'PENDING' || booking.status === 'APPROVED').length,
    HISTORY: bookings.filter((booking) => booking.status === 'REJECTED' || booking.status === 'CANCELLED').length
  }

  const filteredBookings = bookings
    .filter((booking) => {
      if (selectedTab === 'ACTIVE') {
        return booking.status === 'PENDING' || booking.status === 'APPROVED'
      }

      if (selectedTab === 'HISTORY') {
        return booking.status === 'REJECTED' || booking.status === 'CANCELLED'
      }

      return true
    })
    .sort((left, right) => {
      const leftValue = `${left.bookingDate || ''}${left.startTime || ''}${left.id || 0}`
      const rightValue = `${right.bookingDate || ''}${right.startTime || ''}${right.id || 0}`

      if (selectedTab === 'HISTORY') {
        return rightValue.localeCompare(leftValue)
      }

      return leftValue.localeCompare(rightValue)
    })

  const emptyStateCopy = getEmptyStateCopy(selectedTab)

  return (
    <Layout
      title="Booking Management"
      subtitle="Reserve campus resources and review booking activity from one workflow."
      notifications={notifications}
    >
      {submitSuccess && <div className="demo-box">{submitSuccess}</div>}
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

      <div className="card-grid two-col">
        <section className="panel colorful-4 booking-form-shell">
          <div className="booking-section-header">
            <h3>Create Booking</h3>
            <p className="field-helper">
              Request lecture halls, labs, or equipment using a clear date and time slot. New requests are submitted as pending.
            </p>
          </div>

          {resources.length ? (
            <form className="booking-form-grid" onSubmit={createBooking}>
              <div className={`field-block booking-field ${displayErrors.resourceId ? 'field-block-error' : ''}`}>
                <label className="resource-field-label" htmlFor="booking-resource">Select Resource</label>
                <select
                  id="booking-resource"
                  value={form.resourceId}
                  onChange={(e) => updateFormField('resourceId', e.target.value)}
                >
                  <option value="">Choose a hall, lab, or equipment item</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>
                <div className="field-helper">Select a resource from the existing campus catalog.</div>
                {displayErrors.resourceId && <div className="field-error">{displayErrors.resourceId}</div>}
              </div>

              {selectedResource ? (
                <div className="booking-resource-preview">
                  <div className="booking-resource-preview-header">
                    <div>
                      <strong className="booking-resource-title">{selectedResource.name}</strong>
                      <p className="booking-resource-subtitle">{toTitleCase(selectedResource.type)}</p>
                    </div>
                    <span className={`badge ${selectedResource.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                      {selectedResource.status}
                    </span>
                  </div>

                  <div className="booking-resource-grid">
                    <div className="booking-resource-item">
                      <span>Type</span>
                      <strong>{toTitleCase(selectedResource.type)}</strong>
                    </div>
                    <div className="booking-resource-item">
                      <span>Location</span>
                      <strong>{selectedResource.location}</strong>
                    </div>
                    <div className="booking-resource-item">
                      <span>Capacity</span>
                      <strong>{selectedResource.capacity}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="booking-selection-hint">
                  Select a resource to view its type, location, capacity, and current status before creating the booking.
                </div>
              )}

              <div className="booking-two-col">
                <div className={`field-block booking-field ${displayErrors.bookingDate ? 'field-block-error' : ''}`}>
                  <label className="resource-field-label" htmlFor="booking-date">Booking Date</label>
                  <input
                    id="booking-date"
                    type="date"
                    min={getTodayKey()}
                    value={form.bookingDate}
                    onChange={(e) => updateFormField('bookingDate', e.target.value)}
                  />
                  <div className="field-helper">Choose the calendar date for the booking.</div>
                  {displayErrors.bookingDate && <div className="field-error">{displayErrors.bookingDate}</div>}
                </div>

                <div className={`field-block booking-field ${displayErrors.expectedAttendees ? 'field-block-error' : ''}`}>
                  <label className="resource-field-label" htmlFor="booking-attendees">Expected Attendees</label>
                  <input
                    id="booking-attendees"
                    type="number"
                    min="1"
                    placeholder="Enter attendee count"
                    value={form.expectedAttendees}
                    onChange={(e) => updateFormField('expectedAttendees', e.target.value)}
                  />
                  <div className="field-helper">
                    {selectedResource
                      ? `Capacity available for this resource: ${selectedResource.capacity}.`
                      : 'Enter the estimated number of attendees for this booking.'}
                  </div>
                  {displayErrors.expectedAttendees && <div className="field-error">{displayErrors.expectedAttendees}</div>}
                </div>
              </div>

              <div className="booking-two-col">
                <div className={`field-block booking-field ${displayErrors.startTime ? 'field-block-error' : ''}`}>
                  <label className="resource-field-label" htmlFor="booking-start-time">Start Time</label>
                  <input
                    id="booking-start-time"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => updateFormField('startTime', e.target.value)}
                  />
                  <div className="field-helper">Select the exact time the booking should begin.</div>
                  {displayErrors.startTime && <div className="field-error">{displayErrors.startTime}</div>}
                </div>

                <div className={`field-block booking-field ${displayErrors.endTime ? 'field-block-error' : ''}`}>
                  <label className="resource-field-label" htmlFor="booking-end-time">End Time</label>
                  <input
                    id="booking-end-time"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => updateFormField('endTime', e.target.value)}
                  />
                  <div className="field-helper">End time must be later than the selected start time.</div>
                  {displayErrors.endTime && <div className="field-error">{displayErrors.endTime}</div>}
                </div>
              </div>

              <div className={`field-block booking-field ${displayErrors.purpose ? 'field-block-error' : ''}`}>
                <label className="resource-field-label" htmlFor="booking-purpose">Purpose</label>
                <textarea
                  id="booking-purpose"
                  placeholder="Describe the lecture, lab session, event, or equipment use"
                  value={form.purpose}
                  onChange={(e) => updateFormField('purpose', e.target.value)}
                />
                <div className="field-helper">Briefly explain why the resource is being requested.</div>
                {displayErrors.purpose && <div className="field-error">{displayErrors.purpose}</div>}
              </div>

              <div className="booking-form-footer">
                <p className="booking-submit-note">
                  The final availability check is confirmed against existing bookings when you submit the request.
                </p>
                <button className="primary-btn booking-submit-btn" disabled={!canSubmit}>
                  {isSubmitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          ) : (
            <div className="empty-state booking-empty-state">
              <strong>No resources are available yet</strong>
              <p>Add resources first so users can create bookings from the catalog.</p>
            </div>
          )}
        </section>

        <section className="panel booking-list-shell">
          <div className="booking-section-header">
            <div className="row between gap wrap">
              <div>
                <h3>{user?.role === 'ADMIN' ? 'Booking Queue' : 'My Bookings'}</h3>
                <p className="field-helper">
                  Review active requests, previous decisions, and completed booking history.
                </p>
              </div>
              <div className="booking-count-stack">
                <div className="resource-count-pill">{tabCounts.ACTIVE} active</div>
              </div>
            </div>
          </div>

          <div className="booking-filter-tabs">
            {BOOKING_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`booking-filter-tab ${selectedTab === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="booking-filter-count">{tabCounts[tab.id]}</span>
              </button>
            ))}
          </div>

          {filteredBookings.length ? (
            <div className="booking-list-grid">
              {filteredBookings.map((booking) => {
                const isHistory = booking.status === 'REJECTED' || booking.status === 'CANCELLED'
                const canApproveOrReject = user?.role === 'ADMIN' && booking.status === 'PENDING'
                const canCancel = booking.status === 'APPROVED'
                const isActing = activeActionId === booking.id

                return (
                  <article
                    key={booking.id}
                    className={`booking-card ${isHistory ? 'booking-card-muted' : ''}`}
                  >
                    <div className="booking-card-header">
                      <div>
                        <span className="booking-card-kicker">{toTitleCase(booking.resource?.type)}</span>
                        <strong className="booking-title">{booking.resource?.name || 'Unknown resource'}</strong>
                        <p className="booking-subtitle">
                          {formatDate(booking.bookingDate)} - {formatTimeRange(booking.startTime, booking.endTime)}
                        </p>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(booking.status)}`}>{booking.status}</span>
                    </div>

                    <div className="booking-meta-grid">
                      <div className="booking-meta-item">
                        <span>Booking Date</span>
                        <strong>{formatDate(booking.bookingDate)}</strong>
                      </div>
                      <div className="booking-meta-item">
                        <span>Time Range</span>
                        <strong>{formatTimeRange(booking.startTime, booking.endTime)}</strong>
                      </div>
                      <div className="booking-meta-item booking-meta-item-wide">
                        <span>Purpose</span>
                        <strong>{booking.purpose || 'No purpose provided'}</strong>
                      </div>
                      <div className="booking-meta-item">
                        <span>Expected Attendees</span>
                        <strong>{booking.expectedAttendees ?? '-'}</strong>
                      </div>
                    </div>

                    {(canApproveOrReject || canCancel) && (
                      <div className="booking-card-footer">
                        <p className="booking-note">
                          {booking.status === 'PENDING'
                            ? 'This request is waiting for an approval decision.'
                            : 'This approved booking can still be cancelled if needed.'}
                        </p>
                        <div className="row gap wrap booking-actions">
                          {canApproveOrReject && (
                            <>
                              <button
                                className="small-btn"
                                type="button"
                                disabled={isActing}
                                onClick={() => runBookingAction(booking, 'APPROVED')}
                              >
                                {isActing && activeActionType === 'APPROVED' ? 'Approving...' : 'Approve'}
                              </button>
                              <button
                                className="small-btn danger-btn"
                                type="button"
                                disabled={isActing}
                                onClick={() => runBookingAction(booking, 'REJECTED')}
                              >
                                {isActing && activeActionType === 'REJECTED' ? 'Rejecting...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {canCancel && (
                            <button
                              className="small-btn"
                              type="button"
                              disabled={isActing}
                              onClick={() => runBookingAction(booking, 'CANCELLED')}
                            >
                              {isActing && activeActionType === 'CANCELLED' ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state booking-empty-state">
              <strong>{emptyStateCopy.title}</strong>
              <p>{emptyStateCopy.detail}</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
