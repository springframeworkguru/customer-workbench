import { fireEvent, render, screen } from '@testing-library/react'
import InteractionsPage from './InteractionsPage'
import { useInteractions } from '../hooks/useInteractions'
import type { Interaction } from '../types/interaction'
import type { Page } from '../types/pagination'

jest.mock('../hooks/useInteractions')

const mockUseInteractions = useInteractions as jest.MockedFunction<typeof useInteractions>

const samplePage: Page<Interaction> = {
  content: [
    {
      id: 1,
      customerId: 123,
      productId: 1,
      interactionType: 'CHAT',
      interactionDate: '2025-01-01T12:00:00Z',
      responsesFromCustomerSupport: 'We have updated your order',
      customerRating: 5,
      feedback: 'Great support',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
}

const buildState = (overrides: Partial<ReturnType<typeof useInteractions>> = {}) => ({
  data: samplePage,
  loading: false,
  error: null,
  query: { page: 0, size: 10 },
  search: jest.fn(() => Promise.resolve()),
  setPage: jest.fn(() => Promise.resolve()),
  refresh: jest.fn(() => Promise.resolve()),
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  mockUseInteractions.mockReturnValue(buildState())
})

test('renders interaction results and stats', () => {
  render(<InteractionsPage />)

  expect(screen.getByText('Customer Interactions')).toBeInTheDocument()
  // Message comes from `feedback` when present
  expect(screen.getByText('Great support')).toBeInTheDocument()
  expect(screen.getByText('123')).toBeInTheDocument()
  // Interaction type renders the enum value
  expect(screen.getByText('CHAT')).toBeInTheDocument()
  // Card description shows: "Showing 1 of 1 record"
  expect(screen.getByText(/Showing\s+1\s+of\s+1\s+record\b/)).toBeInTheDocument()
  expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
})

test('shows loading state', () => {
  mockUseInteractions.mockReturnValue(buildState({ loading: true }))

  render(<InteractionsPage />)

  expect(screen.getByText(/Loading interactions/i)).toBeInTheDocument()
})

test('shows error state', () => {
  mockUseInteractions.mockReturnValue(buildState({ error: 'Something went wrong' }))

  render(<InteractionsPage />)

  expect(screen.getByText('Something went wrong')).toBeInTheDocument()
})

test('submits filters with expected payload', () => {
  const search = jest.fn()
  const setPage = jest.fn(() => Promise.resolve())

  mockUseInteractions.mockReturnValue(buildState({ search, setPage }))

  render(<InteractionsPage />)

  fireEvent.change(screen.getByLabelText(/Customer ID/i), { target: { value: '42' } })
  fireEvent.change(screen.getByLabelText(/Interaction Type/i), { target: { value: 'EMAIL' } })
  // datetime-local inputs require full local datetime (YYYY-MM-DDTHH:MM)
  const startLocal = '2025-01-10T00:00'
  const endLocal = '2025-01-11T00:00'
  fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: startLocal } })
  fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: endLocal } })

  fireEvent.click(screen.getByRole('button', { name: /Apply filters/i }))

  // The page logic is handled within `search` by normalizing to page 0
  expect(setPage).not.toHaveBeenCalled()
  expect(search).toHaveBeenCalledWith(
    expect.objectContaining({
      customerId: 42,
      interactionType: 'EMAIL',
      startDate: new Date(startLocal).toISOString(),
      endDate: new Date(endLocal).toISOString(),
      page: 0,
    }),
  )
})

test('allows querying without customerId (customerId omitted from payload)', () => {
  const search = jest.fn()
  mockUseInteractions.mockReturnValue(buildState({ search }))

  render(<InteractionsPage />)

  // Leave Customer ID empty; choose only interaction type
  fireEvent.change(screen.getByLabelText(/Interaction type/i), { target: { value: 'CHAT' } })

  fireEvent.click(screen.getByRole('button', { name: /Apply filters/i }))

  // Expect search called with page reset to 0 and WITHOUT a customerId key
  expect(search).toHaveBeenCalled()
  const callArg = (search.mock.calls[0] ?? [])[0] as Record<string, unknown>
  expect(callArg.page).toBe(0)
  expect(callArg.interactionType).toBe('CHAT')
  // buildQuery sets empty fields to undefined; API layer strips them before request
  expect(callArg.customerId).toBeUndefined()
})

test('pagination controls call setPage', () => {
  const setPage = jest.fn(() => Promise.resolve())
  mockUseInteractions.mockReturnValue(
    buildState({
      setPage,
      query: { page: 1, size: 10 },
      data: { ...samplePage, number: 1, first: false, last: false, totalPages: 3 },
    }),
  )

  render(<InteractionsPage />)

  fireEvent.click(screen.getByRole('button', { name: /Previous/i }))
  fireEvent.click(screen.getByRole('button', { name: /Next/i }))

  expect(setPage).toHaveBeenCalledWith(0)
  expect(setPage).toHaveBeenCalledWith(2)
})