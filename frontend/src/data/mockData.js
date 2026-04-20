const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)
const nextWeek = new Date(today)
nextWeek.setDate(today.getDate() + 7)

function dateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const mockUsers = {
  'admin@campus.com': {
    id: 1,
    fullName: 'Campus Admin',
    email: 'admin@campus.com',
    password: 'Admin@123',
    role: 'ADMIN'
  },
  'user@campus.com': {
    id: 2,
    fullName: 'Campus User',
    email: 'user@campus.com',
    password: 'User@123',
    role: 'USER'
  },
  'tech@campus.com': {
    id: 3,
    fullName: 'Campus Technician',
    email: 'tech@campus.com',
    password: 'Tech@123',
    role: 'TECHNICIAN'
  }
}

export const mockResources = [
  {
    id: 1,
    name: 'Main Lecture Hall',
    type: 'LECTURE_HALL',
    capacity: 120,
    location: 'Academic Block A - Floor 2',
    status: 'ACTIVE',
    description: 'Large hall with projector, sound system, and fixed seating.'
  },
  {
    id: 2,
    name: 'Computer Lab 3',
    type: 'LAB',
    capacity: 36,
    location: 'Technology Center - Room 304',
    status: 'ACTIVE',
    description: 'Desktop lab configured for programming, database, and networking sessions.'
  },
  {
    id: 3,
    name: 'Portable Projector Kit',
    type: 'EQUIPMENT',
    capacity: 4,
    location: 'Media Services Store',
    status: 'ACTIVE',
    description: 'Portable projector sets with HDMI cable, remote, and carrying case.'
  },
  {
    id: 4,
    name: 'Chemistry Lab 1',
    type: 'LAB',
    capacity: 28,
    location: 'Science Block - Room 112',
    status: 'OUT_OF_SERVICE',
    description: 'Temporarily unavailable while ventilation maintenance is completed.'
  }
]

export const mockBookings = [
  {
    id: 101,
    resourceId: 1,
    resource: mockResources[0],
    bookingDate: dateKey(today),
    startTime: '09:00',
    endTime: '10:30',
    purpose: 'Software Engineering lecture',
    expectedAttendees: 95,
    status: 'APPROVED'
  },
  {
    id: 102,
    resourceId: 2,
    resource: mockResources[1],
    bookingDate: dateKey(tomorrow),
    startTime: '13:00',
    endTime: '15:00',
    purpose: 'Database practical session',
    expectedAttendees: 30,
    status: 'PENDING'
  },
  {
    id: 103,
    resourceId: 3,
    resource: mockResources[2],
    bookingDate: dateKey(nextWeek),
    startTime: '08:30',
    endTime: '12:00',
    purpose: 'Guest speaker setup',
    expectedAttendees: 1,
    status: 'PENDING'
  },
  {
    id: 104,
    resourceId: 4,
    resource: mockResources[3],
    bookingDate: dateKey(today),
    startTime: '11:00',
    endTime: '12:00',
    purpose: 'Lab safety briefing',
    expectedAttendees: 24,
    status: 'REJECTED'
  }
]

export const mockSupportStaff = [
  {
    id: 3,
    fullName: 'Campus Technician',
    role: 'TECHNICIAN'
  },
  {
    id: 4,
    fullName: 'Facilities Officer',
    role: 'TECHNICIAN'
  }
]

export const mockTickets = [
  {
    id: 201,
    resource: mockResources[0],
    resourceId: 1,
    location: 'Academic Block A - Floor 2',
    category: 'Equipment',
    priority: 'HIGH',
    preferredContact: 'admin@campus.com',
    description: 'Projector flickers during lectures and occasionally loses HDMI signal.',
    attachment1: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    attachment2: '',
    attachment3: '',
    status: 'OPEN',
    assignedTo: null,
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 202,
    resource: mockResources[1],
    resourceId: 2,
    location: 'Technology Center - Room 304',
    category: 'Network',
    priority: 'MEDIUM',
    preferredContact: 'tech@campus.com',
    description: 'Several lab computers are intermittently losing network access.',
    attachment1: '',
    attachment2: '',
    attachment3: '',
    status: 'IN_PROGRESS',
    assignedTo: mockSupportStaff[0],
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 203,
    resource: null,
    resourceId: '',
    location: 'Library entrance',
    category: 'Safety',
    priority: 'LOW',
    preferredContact: 'user@campus.com',
    description: 'Loose floor mat near the library entrance needs to be secured.',
    attachment1: '',
    attachment2: '',
    attachment3: '',
    status: 'RESOLVED',
    assignedTo: mockSupportStaff[1],
    resolutionNotes: 'Facilities team secured the mat and checked the surrounding area.',
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 48).toISOString()
  }
]

export const mockTicketComments = {
  201: [
    {
      id: 301,
      author: mockSupportStaff[0],
      content: 'A replacement HDMI cable is being tested before the next lecture.',
      createdAt: new Date(today.getTime() - 1000 * 60 * 45).toISOString()
    }
  ],
  202: [
    {
      id: 302,
      author: mockSupportStaff[0],
      content: 'Switch logs show intermittent link drops. Checking the patch panel next.',
      createdAt: new Date(today.getTime() - 1000 * 60 * 120).toISOString()
    }
  ]
}

export const mockNotifications = [
  {
    id: 401,
    title: 'Booking approved',
    message: 'Main Lecture Hall has been approved for today at 09:00.',
    type: 'BOOKING',
    read: false,
    createdAt: new Date(today.getTime() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 402,
    title: 'Ticket update',
    message: 'Computer Lab 3 network issue is now in progress.',
    type: 'TICKET',
    read: false,
    createdAt: new Date(today.getTime() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 403,
    title: 'Resource unavailable',
    message: 'Chemistry Lab 1 remains out of service for maintenance.',
    type: 'GENERAL',
    read: true,
    createdAt: new Date(today.getTime() - 1000 * 60 * 60 * 7).toISOString()
  }
]

export function cloneMockData(value) {
  return JSON.parse(JSON.stringify(value))
}
