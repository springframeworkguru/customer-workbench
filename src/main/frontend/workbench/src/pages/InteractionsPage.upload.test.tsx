import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import InteractionsPage from './InteractionsPage'
import { useInteractions } from '../hooks/useInteractions'
import * as interactionsService from '../services/interactions'

jest.mock('../hooks/useInteractions')
jest.mock('../services/interactions')

const mockUseInteractions = useInteractions as jest.MockedFunction<typeof useInteractions>

const buildState = (overrides: Partial<ReturnType<typeof useInteractions>> = {}) => ({
  data: { content: [], number: 0, size: 10, totalPages: 0, totalElements: 0, first: true, last: true, empty: true },
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
  // jsdom does not implement alert; provide a stub to avoid console noise
  ;(window as unknown as { alert: (msg: string) => void }).alert = jest.fn()
})

test('uploads JSON file and refreshes', async () => {
  ;(interactionsService.createInteraction as jest.Mock).mockResolvedValue({ id: 1 })

  render(<InteractionsPage />)

  const jsonInput = screen.getByLabelText(/Upload JSON file/i)
  const json = JSON.stringify({ productId: 1, customerId: 2, interactionType: 'CHAT', interactionDate: new Date().toISOString() })
  const file = new File([json], 'interaction.json', { type: 'application/json' })
  ;(file as unknown as { text: () => Promise<string> }).text = () => Promise.resolve(json)

  fireEvent.change(jsonInput, { target: { files: [file] } })

  await waitFor(() => expect(interactionsService.createInteraction).toHaveBeenCalled())
  expect(mockUseInteractions().refresh).toHaveBeenCalled()
  expect(screen.getByText(/JSON interaction uploaded/i)).toBeInTheDocument()
})

test('uploads CSV file and shows count', async () => {
  ;(interactionsService.uploadCsv as jest.Mock).mockResolvedValue({ ingested: 5 })

  render(<InteractionsPage />)

  const csvInput = screen.getByLabelText(/Upload CSV file/i)
  const file = new File(['a,b\n1,2'], 'interaction.csv', { type: 'text/csv' })

  fireEvent.change(csvInput, { target: { files: [file] } })

  await waitFor(() => expect(interactionsService.uploadCsv).toHaveBeenCalled())
  expect(mockUseInteractions().refresh).toHaveBeenCalled()
  expect(await screen.findByText(/ingested from CSV/i)).toBeInTheDocument()
})

test('creates interaction via dialog', async () => {
  ;(interactionsService.createInteraction as jest.Mock).mockResolvedValue({ id: 10 })

  render(<InteractionsPage />)

  fireEvent.click(screen.getByRole('button', { name: /New/i }))
  const dialog = screen.getByRole('dialog')
  expect(dialog).toBeInTheDocument()

  fireEvent.change(within(dialog).getByLabelText(/Product ID/i), { target: { value: '1001' } })
  fireEvent.change(within(dialog).getByLabelText(/^Customer ID$/i), { target: { value: '42' } })
  fireEvent.change(within(dialog).getByLabelText(/Interaction Type/i), { target: { value: 'EMAIL' } })
  fireEvent.change(within(dialog).getByLabelText(/Customer Rating/i), { target: { value: '4' } })
  fireEvent.change(within(dialog).getByLabelText(/Customer Message/i), { target: { value: 'Hello' } })
  // leave timestamp empty to use now
  fireEvent.change(within(dialog).getByLabelText(/Support Message/i), { target: { value: 'Hi' } })

  fireEvent.click(screen.getByRole('button', { name: /Create interaction/i }))

  await waitFor(() => expect(interactionsService.createInteraction).toHaveBeenCalled())
  expect(mockUseInteractions().refresh).toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
