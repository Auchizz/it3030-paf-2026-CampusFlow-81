import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import {
  cloneMockData,
  mockNotifications,
  mockResources,
  mockSupportStaff,
  mockTicketComments,
  mockTickets
} from '../data/mockData'

const TICKET_CATEGORIES = [
  'Electrical',
  'Network',
  'Equipment',
  'Furniture',
  'Cleaning',
  'Safety',
  'Air Conditioning',
  'Other'
]

const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const TICKET_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'RESOLVED_CLOSED', label: 'Resolved / Closed' },
  { id: 'REJECTED', label: 'Rejected' }
]

const initialForm = {
  resourceId: '',
  location: '',
  category: '',
  priority: 'MEDIUM',
  preferredContact: '',
  description: '',
  attachment1: '',
  attachment2: '',
  attachment3: ''
}

function toTitleCase(value) {
  return (value || '')
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDateTime(value) {
  if (!value) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function getTicketStatusBadgeClass(status) {
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return 'success'
  }

  if (status === 'REJECTED') {
    return 'danger'
  }

  if (status === 'IN_PROGRESS') {
    return 'neutral'
  }

  return 'warning'
}

function getPriorityBadgeClass(priority) {
  if (priority === 'HIGH' || priority === 'CRITICAL') {
    return 'danger'
  }

  if (priority === 'MEDIUM') {
    return 'warning'
  }

  return 'success'
}

function validateTicketForm(form, selectedResource) {
  const errors = {}

  if (!selectedResource && !form.location.trim()) {
    errors.location = 'Location is required when no resource is selected.'
  }

  if (!form.category) {
    errors.category = 'Category is required.'
  }

  if (!form.priority) {
    errors.priority = 'Priority is required.'
  }

  if (!form.preferredContact.trim()) {
    errors.preferredContact = 'Preferred contact is required.'
  }

  if (!form.description.trim()) {
    errors.description = 'Description is required.'
  }

  return errors
}

function getEmptyStateCopy(selectedTab) {
  if (selectedTab === 'OPEN') {
    return {
      title: 'No open tickets',
      detail: 'New maintenance requests and incidents that still need action will appear here.'
    }
  }

  if (selectedTab === 'IN_PROGRESS') {
    return {
      title: 'No tickets in progress',
      detail: 'Assigned work items will appear here once a technician starts handling them.'
    }
  }

  if (selectedTab === 'RESOLVED_CLOSED') {
    return {
      title: 'No resolved or closed tickets',
      detail: 'Completed maintenance work will appear here once issues are resolved.'
    }
  }

  if (selectedTab === 'REJECTED') {
    return {
      title: 'No rejected tickets',
      detail: 'Any tickets rejected by the admin team will appear here with their reasons.'
    }
  }

  return {
    title: 'No tickets yet',
    detail: 'Create the first ticket from the form on the left to start tracking campus issues.'
  }
}

function matchesTab(ticket, selectedTab) {
  if (selectedTab === 'OPEN') {
    return ticket.status === 'OPEN'
  }

  if (selectedTab === 'IN_PROGRESS') {
    return ticket.status === 'IN_PROGRESS'
  }

  if (selectedTab === 'RESOLVED_CLOSED') {
    return ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
  }

  if (selectedTab === 'REJECTED') {
    return ticket.status === 'REJECTED'
  }

  return true
}

function getTicketPreview(description) {
  if (!description) {
    return 'No description provided.'
  }

  if (description.length <= 180) {
    return description
  }

  return `${description.slice(0, 177)}...`
}

export default function TicketsPage() {
  const [resources] = useState(() => cloneMockData(mockResources))
  const [supportStaff, setSupportStaff] = useState(() => cloneMockData(mockSupportStaff))
  const [tickets, setTickets] = useState(() => cloneMockData(mockTickets))
  const [comments, setComments] = useState(() => cloneMockData(mockTicketComments))
  const [notifications] = useState(() => cloneMockData(mockNotifications))
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [selectedTab, setSelectedTab] = useState('OPEN')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeActionId, setActiveActionId] = useState(null)
  const [activeActionType, setActiveActionType] = useState('')
  const [ticketDrafts, setTicketDrafts] = useState({})
  const { user } = useAuth()

  const selectedResource = resources.find((resource) => String(resource.id) === String(form.resourceId)) || null
  const liveErrors = validateTicketForm(form, selectedResource)

  const displayErrors = {
    location: fieldErrors.location,
    category: fieldErrors.category,
    priority: fieldErrors.priority,
    preferredContact: fieldErrors.preferredContact,
    description: fieldErrors.description
  }

  const canSubmit = Object.keys(liveErrors).length === 0 && !isSubmitting

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }))

    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const updateTicketDraft = (ticketId, field, value) => {
    setTicketDrafts((currentDrafts) => ({
      ...currentDrafts,
      [ticketId]: {
        ...currentDrafts[ticketId],
        [field]: value
      }
    }))
  }

  const createTicket = (e) => {
    e.preventDefault()

    if (Object.keys(liveErrors).length > 0) {
      setFieldErrors(liveErrors)
      setSubmitError('Please correct the highlighted ticket details before submitting.')
      setSubmitSuccess('')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    setFieldErrors({})

    setTickets((currentTickets) => [
      {
        id: Date.now(),
        resourceId: form.resourceId,
        resource: selectedResource,
        location: form.location.trim() || selectedResource?.location || '',
        category: form.category,
        priority: form.priority,
        preferredContact: form.preferredContact.trim(),
        description: form.description.trim(),
        attachment1: form.attachment1.trim(),
        attachment2: form.attachment2.trim(),
        attachment3: form.attachment3.trim(),
        status: 'OPEN',
        assignedTo: null,
        createdAt: new Date().toISOString()
      },
      ...currentTickets
    ])
    setSubmitSuccess('Ticket created successfully.')
    setForm(initialForm)
    setIsSubmitting(false)
  }

  const runTicketStatusAction = (ticket, nextStatus) => {
    const draft = ticketDrafts[ticket.id] || {}
    const rejectionReason = draft.rejectionReason?.trim() || ''
    const resolutionNotes = draft.workNote?.trim() || ''

    if (nextStatus === 'REJECTED' && !rejectionReason) {
      setSubmitError('Add a rejection reason before rejecting this ticket.')
      return
    }

    setActiveActionId(ticket.id)
    setActiveActionType(nextStatus)
    setSubmitError('')
    setSubmitSuccess('')

    setTickets((currentTickets) =>
      currentTickets.map((currentTicket) =>
        currentTicket.id === ticket.id
          ? {
              ...currentTicket,
              status: nextStatus,
              resolutionNotes:
                nextStatus === 'RESOLVED' || nextStatus === 'IN_PROGRESS' || nextStatus === 'CLOSED'
                  ? resolutionNotes || currentTicket.resolutionNotes
                  : currentTicket.resolutionNotes,
              rejectionReason: nextStatus === 'REJECTED' ? rejectionReason : currentTicket.rejectionReason
            }
          : currentTicket
      )
    )
    setSubmitSuccess(`Ticket marked as ${toTitleCase(nextStatus)}.`)
    setTicketDrafts((currentDrafts) => ({
      ...currentDrafts,
      [ticket.id]: {
        ...currentDrafts[ticket.id],
        workNote: '',
        rejectionReason: ''
      }
    }))
    setActiveActionId(null)
    setActiveActionType('')
  }

  const assignTicket = (ticket) => {
    const draft = ticketDrafts[ticket.id] || {}
    const technicianId = draft.supportStaffId

    if (!technicianId) {
      setSubmitError('Select a technician or support staff member before assigning the ticket.')
      return
    }

    setActiveActionId(ticket.id)
    setActiveActionType('ASSIGN')
    setSubmitError('')
    setSubmitSuccess('')

    const selectedStaff = supportStaff.find((staffMember) => String(staffMember.id) === String(technicianId))

    setTickets((currentTickets) =>
      currentTickets.map((currentTicket) =>
        currentTicket.id === ticket.id ? { ...currentTicket, assignedTo: selectedStaff } : currentTicket
      )
    )
    setSubmitSuccess('Ticket assigned successfully.')
    setActiveActionId(null)
    setActiveActionType('')
  }

  const addComment = (ticket) => {
    const draft = ticketDrafts[ticket.id] || {}
    const content = draft.comment?.trim() || ''

    if (!content) {
      setSubmitError('Write a short progress note or question before adding a comment.')
      return
    }

    setActiveActionId(ticket.id)
    setActiveActionType('COMMENT')
    setSubmitError('')
    setSubmitSuccess('')

    setComments((currentComments) => ({
      ...currentComments,
      [ticket.id]: [
        ...(currentComments[ticket.id] || []),
        {
          id: Date.now(),
          author: user,
          content,
          createdAt: new Date().toISOString()
        }
      ]
    }))
    setSubmitSuccess('Comment added successfully.')
    setTicketDrafts((currentDrafts) => ({
      ...currentDrafts,
      [ticket.id]: {
        ...currentDrafts[ticket.id],
        comment: ''
      }
    }))
    setActiveActionId(null)
    setActiveActionType('')
  }

  const tabCounts = {
    ALL: tickets.length,
    OPEN: tickets.filter((ticket) => ticket.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    RESOLVED_CLOSED: tickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length,
    REJECTED: tickets.filter((ticket) => ticket.status === 'REJECTED').length
  }

  const filteredTickets = tickets.filter((ticket) => matchesTab(ticket, selectedTab))
  const emptyStateCopy = getEmptyStateCopy(selectedTab)

  return (
    <Layout
      title="Maintenance & Incident Tickets"
      subtitle="Report campus issues, assign support staff, and track progress from one clean workflow."
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
        <section className="panel colorful-2 ticket-form-shell">
          <div className="ticket-section-header">
            <h3>Create Ticket</h3>
            <p className="field-helper">
              Report maintenance issues and incidents for rooms, labs, equipment, or general campus spaces with enough
              detail for support staff to act quickly.
            </p>
          </div>

          <form className="ticket-form-grid" onSubmit={createTicket}>
            <div className="field-block ticket-field">
              <label className="resource-field-label" htmlFor="ticket-resource">Optional Resource</label>
              <select
                id="ticket-resource"
                value={form.resourceId}
                onChange={(e) => updateFormField('resourceId', e.target.value)}
              >
                <option value="">General campus location</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
              <div className="field-helper">
                Select a resource if the issue is tied to a known room, lab, or equipment item. Leave it blank for
                general campus incidents.
              </div>
            </div>

            {selectedResource ? (
              <div className="ticket-resource-preview">
                <div className="ticket-resource-preview-header">
                  <div>
                    <strong className="ticket-resource-title">{selectedResource.name}</strong>
                    <p className="ticket-resource-subtitle">{toTitleCase(selectedResource.type)}</p>
                  </div>
                  <span className={`badge ${selectedResource.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                    {selectedResource.status}
                  </span>
                </div>

                <div className="ticket-resource-grid">
                  <div className="ticket-resource-item">
                    <span>Location</span>
                    <strong>{selectedResource.location}</strong>
                  </div>
                  <div className="ticket-resource-item">
                    <span>Capacity</span>
                    <strong>{selectedResource.capacity}</strong>
                  </div>
                  <div className="ticket-resource-item">
                    <span>Type</span>
                    <strong>{toTitleCase(selectedResource.type)}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ticket-selection-hint">
                No specific resource selected. Use the location field below to describe the building, room, lab, or
                campus area where the issue happened.
              </div>
            )}

            <div className="ticket-two-col">
              <div className={`field-block ticket-field ${displayErrors.location ? 'field-block-error' : ''}`}>
                <label className="resource-field-label" htmlFor="ticket-location">Location</label>
                <input
                  id="ticket-location"
                  placeholder={selectedResource ? 'Leave blank to use the selected resource location' : 'Ex: Engineering Block, Lab L-204'}
                  value={form.location}
                  onChange={(e) => updateFormField('location', e.target.value)}
                />
                <div className="field-helper">
                  {selectedResource
                    ? 'If left blank, the selected resource location will be used automatically.'
                    : 'Provide a clear building, room, lab, office, or campus area.'}
                </div>
                {displayErrors.location && <div className="field-error">{displayErrors.location}</div>}
              </div>

              <div className={`field-block ticket-field ${displayErrors.preferredContact ? 'field-block-error' : ''}`}>
                <label className="resource-field-label" htmlFor="ticket-contact">Preferred Contact</label>
                <input
                  id="ticket-contact"
                  placeholder="Ex: user@campus.com or Ext. 2145"
                  value={form.preferredContact}
                  onChange={(e) => updateFormField('preferredContact', e.target.value)}
                />
                <div className="field-helper">Share the best email, phone number, or extension for follow-up questions.</div>
                {displayErrors.preferredContact && <div className="field-error">{displayErrors.preferredContact}</div>}
              </div>
            </div>

            <div className="ticket-two-col">
              <div className={`field-block ticket-field ${displayErrors.category ? 'field-block-error' : ''}`}>
                <label className="resource-field-label" htmlFor="ticket-category">Category</label>
                <select
                  id="ticket-category"
                  value={form.category}
                  onChange={(e) => updateFormField('category', e.target.value)}
                >
                  <option value="">Select ticket category</option>
                  {TICKET_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="field-helper">Choose the category that best matches the maintenance or incident type.</div>
                {displayErrors.category && <div className="field-error">{displayErrors.category}</div>}
              </div>

              <div className={`field-block ticket-field ${displayErrors.priority ? 'field-block-error' : ''}`}>
                <label className="resource-field-label" htmlFor="ticket-priority">Priority</label>
                <select
                  id="ticket-priority"
                  value={form.priority}
                  onChange={(e) => updateFormField('priority', e.target.value)}
                >
                  {TICKET_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <div className="field-helper">Use HIGH for urgent but non-emergency problems that need prompt handling.</div>
                {displayErrors.priority && <div className="field-error">{displayErrors.priority}</div>}
              </div>
            </div>

            <div className={`field-block ticket-field ${displayErrors.description ? 'field-block-error' : ''}`}>
              <label className="resource-field-label" htmlFor="ticket-description">Description</label>
              <textarea
                id="ticket-description"
                placeholder="Describe what happened, when it started, what is affected, and any immediate risk or impact on classes, labs, or campus operations."
                value={form.description}
                onChange={(e) => updateFormField('description', e.target.value)}
              />
              <div className="field-helper">
                Include symptoms, affected devices or spaces, safety impact, and anything support staff should know before arriving.
              </div>
              {displayErrors.description && <div className="field-error">{displayErrors.description}</div>}
            </div>

            <div className="ticket-attachments-grid">
              {[1, 2, 3].map((index) => (
                <div key={index} className="field-block ticket-field">
                  <label className="resource-field-label" htmlFor={`ticket-attachment-${index}`}>{`Attachment ${index}`}</label>
                  <input
                    id={`ticket-attachment-${index}`}
                    placeholder={`Attachment ${index} URL (optional)`}
                    value={form[`attachment${index}`]}
                    onChange={(e) => updateFormField(`attachment${index}`, e.target.value)}
                  />
                  <div className="field-helper">If you are using a file link, paste the direct URL here.</div>
                </div>
              ))}
            </div>

            <div className="ticket-form-footer">
              <p className="ticket-submit-note">
                Tickets are created as OPEN and can then be assigned, worked on, resolved, closed, or rejected depending on role.
              </p>
              <button className="primary-btn ticket-submit-btn" disabled={!canSubmit}>
                {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel ticket-list-shell">
          <div className="ticket-section-header">
            <div className="row between gap wrap">
              <div>
                <h3>{user?.role === 'ADMIN' ? 'Campus Ticket Queue' : user?.role === 'TECHNICIAN' ? 'Assigned Tickets' : 'My Tickets'}</h3>
                <p className="field-helper">
                  Review issue status, assignment, comments, and maintenance outcomes from the current ticket queue.
                </p>
              </div>
              <div className="ticket-count-stack">
                <div className="resource-count-pill">{tabCounts.OPEN} open</div>
              </div>
            </div>
          </div>

          <div className="ticket-filter-tabs">
            {TICKET_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ticket-filter-tab ${selectedTab === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="ticket-filter-count">{tabCounts[tab.id]}</span>
              </button>
            ))}
          </div>

          {filteredTickets.length ? (
            <div className="ticket-list-grid">
              {filteredTickets.map((ticket) => {
                const draft = ticketDrafts[ticket.id] || {}
                const attachments = [ticket.attachment1, ticket.attachment2, ticket.attachment3].filter(Boolean)
                const isAssignedToCurrentUser = ticket.assignedTo?.id === user?.id
                const canManageProgress = user?.role === 'ADMIN' || (user?.role === 'TECHNICIAN' && isAssignedToCurrentUser)
                const canAssign =
                  user?.role === 'ADMIN' &&
                  supportStaff.length > 0 &&
                  ticket.status !== 'CLOSED' &&
                  ticket.status !== 'REJECTED'
                const canMoveToProgress = canManageProgress && ticket.status === 'OPEN'
                const canResolve = canManageProgress && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS')
                const canReject = user?.role === 'ADMIN' && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS')
                const canClose = user?.role === 'ADMIN' && ticket.status === 'RESOLVED'
                const isActing = activeActionId === ticket.id

                return (
                  <article
                    key={ticket.id}
                    className={`ticket-card ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'ticket-card-muted' : ''}`}
                  >
                    <div className="ticket-card-header">
                      <div>
                        <span className="ticket-card-kicker">{ticket.resource?.type ? toTitleCase(ticket.resource.type) : 'General campus issue'}</span>
                        <strong className="ticket-title">{ticket.resource?.name || ticket.category}</strong>
                        <p className="ticket-subtitle">{ticket.location || ticket.resource?.location || 'Campus location not provided'}</p>
                      </div>
                      <div className="ticket-badge-stack">
                        <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>{ticket.priority}</span>
                        <span className={`badge ${getTicketStatusBadgeClass(ticket.status)}`}>{ticket.status}</span>
                      </div>
                    </div>

                    <div className="ticket-meta-grid">
                      <div className="ticket-meta-item">
                        <span>Category</span>
                        <strong>{ticket.category || 'General issue'}</strong>
                      </div>
                      <div className="ticket-meta-item">
                        <span>Reported</span>
                        <strong>{formatDateTime(ticket.createdAt)}</strong>
                      </div>
                      <div className="ticket-meta-item">
                        <span>Assigned Staff</span>
                        <strong>{ticket.assignedTo?.fullName || 'Not assigned yet'}</strong>
                      </div>
                      <div className="ticket-meta-item">
                        <span>Preferred Contact</span>
                        <strong>{ticket.preferredContact || '-'}</strong>
                      </div>
                      <div className="ticket-meta-item ticket-meta-item-wide">
                        <span>Description Preview</span>
                        <strong>{getTicketPreview(ticket.description)}</strong>
                      </div>
                    </div>

                    {attachments.length > 0 && (
                      <div className="ticket-link-row">
                        {attachments.map((attachment, index) => (
                          <a key={`${ticket.id}-${index}`} href={attachment} target="_blank" rel="noreferrer" className="ticket-link-pill">
                            {`Attachment ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    )}

                    {ticket.resolutionNotes && (
                      <div className="ticket-note-block ticket-note-block-success">
                        <span>Resolution Notes</span>
                        <strong>{ticket.resolutionNotes}</strong>
                      </div>
                    )}

                    {ticket.rejectionReason && (
                      <div className="ticket-note-block ticket-note-block-danger">
                        <span>Rejection Reason</span>
                        <strong>{ticket.rejectionReason}</strong>
                      </div>
                    )}

                    <div className="ticket-comments-shell">
                      <div className="ticket-comments-header">
                        <strong>Comments</strong>
                        <span>{(comments[ticket.id] || []).length}</span>
                      </div>

                      {(comments[ticket.id] || []).length ? (
                        <div className="ticket-comment-list">
                          {(comments[ticket.id] || []).map((comment) => (
                            <div key={comment.id} className="ticket-comment">
                              <div className="ticket-comment-meta">
                                <strong>{comment.author?.fullName || 'Support staff'}</strong>
                                <span>{formatDateTime(comment.createdAt)}</span>
                              </div>
                              <p>{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="ticket-comment-empty">No comments yet. Use comments to share progress or ask follow-up questions.</div>
                      )}
                    </div>

                    <div className="ticket-card-footer">
                      <div className="ticket-action-grid">
                        {canAssign && (
                          <div className="field-block ticket-inline-field">
                            <label className="resource-field-label" htmlFor={`assign-${ticket.id}`}>Assign Staff</label>
                            <div className="ticket-inline-action">
                              <select
                                id={`assign-${ticket.id}`}
                                value={draft.supportStaffId || ticket.assignedTo?.id || ''}
                                onChange={(e) => updateTicketDraft(ticket.id, 'supportStaffId', e.target.value)}
                              >
                                <option value="">Select support staff</option>
                                {supportStaff.map((staffMember) => (
                                  <option key={staffMember.id} value={staffMember.id}>
                                    {staffMember.fullName} ({toTitleCase(staffMember.role)})
                                  </option>
                                ))}
                              </select>
                              <button
                                className="small-btn"
                                type="button"
                                disabled={isActing && activeActionType === 'ASSIGN'}
                                onClick={() => assignTicket(ticket)}
                              >
                                {isActing && activeActionType === 'ASSIGN' ? 'Assigning...' : 'Assign'}
                              </button>
                            </div>
                          </div>
                        )}

                        {(canMoveToProgress || canResolve || canClose) && (
                          <div className="field-block ticket-inline-field">
                            <label className="resource-field-label" htmlFor={`note-${ticket.id}`}>Status Note</label>
                            <textarea
                              id={`note-${ticket.id}`}
                              className="ticket-inline-textarea"
                              placeholder="Add a brief progress note or resolution summary"
                              value={draft.workNote || ''}
                              onChange={(e) => updateTicketDraft(ticket.id, 'workNote', e.target.value)}
                            />
                            <div className="row gap wrap ticket-actions">
                              {canMoveToProgress && (
                                <button
                                  className="small-btn"
                                  type="button"
                                  disabled={isActing}
                                  onClick={() => runTicketStatusAction(ticket, 'IN_PROGRESS')}
                                >
                                  {isActing && activeActionType === 'IN_PROGRESS' ? 'Updating...' : 'Mark In Progress'}
                                </button>
                              )}
                              {canResolve && (
                                <button
                                  className="small-btn"
                                  type="button"
                                  disabled={isActing}
                                  onClick={() => runTicketStatusAction(ticket, 'RESOLVED')}
                                >
                                  {isActing && activeActionType === 'RESOLVED' ? 'Resolving...' : 'Resolve'}
                                </button>
                              )}
                              {canClose && (
                                <button
                                  className="small-btn"
                                  type="button"
                                  disabled={isActing}
                                  onClick={() => runTicketStatusAction(ticket, 'CLOSED')}
                                >
                                  {isActing && activeActionType === 'CLOSED' ? 'Closing...' : 'Close'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {canReject && (
                          <div className="field-block ticket-inline-field">
                            <label className="resource-field-label" htmlFor={`reject-${ticket.id}`}>Rejection Reason</label>
                            <div className="ticket-inline-action ticket-inline-action-stacked">
                              <input
                                id={`reject-${ticket.id}`}
                                placeholder="Explain why this ticket is being rejected"
                                value={draft.rejectionReason || ''}
                                onChange={(e) => updateTicketDraft(ticket.id, 'rejectionReason', e.target.value)}
                              />
                              <button
                                className="small-btn danger-btn"
                                type="button"
                                disabled={isActing}
                                onClick={() => runTicketStatusAction(ticket, 'REJECTED')}
                              >
                                {isActing && activeActionType === 'REJECTED' ? 'Rejecting...' : 'Reject'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="field-block ticket-inline-field">
                          <label className="resource-field-label" htmlFor={`comment-${ticket.id}`}>Add Comment</label>
                          <div className="ticket-inline-action ticket-inline-action-stacked">
                            <input
                              id={`comment-${ticket.id}`}
                              placeholder="Share a progress update, clarification, or follow-up question"
                              value={draft.comment || ''}
                              onChange={(e) => updateTicketDraft(ticket.id, 'comment', e.target.value)}
                            />
                            <button
                              className="small-btn"
                              type="button"
                              disabled={isActing}
                              onClick={() => addComment(ticket)}
                            >
                              {isActing && activeActionType === 'COMMENT' ? 'Posting...' : 'Add Comment'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state ticket-empty-state">
              <strong>{emptyStateCopy.title}</strong>
              <p>{emptyStateCopy.detail}</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
