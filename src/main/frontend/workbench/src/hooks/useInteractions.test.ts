import { act, renderHook, waitFor } from '@testing-library/react'
import { useInteractions } from './useInteractions'
import { fetchInteractions } from '../services/interactions'
import type { Interaction } from '../types/interaction'
import type { Page } from '../types/pagination'

jest.mock('../services/interactions')

const mockFetchInteractions = fetchInteractions as jest.MockedFunction<typeof fetchInteractions>

const samplePage: Page<Interaction> = {
  content: [
    {
      id: 1,
      customerId: 123,
      productId: 1,
      interactionType: 'CHAT',
      interactionDate: '2025-01-01T12:00:00Z',
      responsesFromCustomerSupport: 'Hi',
      customerRating: 4,
      feedback: 'Nice',
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

beforeEach(() => {
  jest.clearAllMocks()
})

test('loads interactions on mount', async () => {
  mockFetchInteractions.mockResolvedValueOnce(samplePage)

  const { result } = renderHook(() => useInteractions())

  expect(mockFetchInteractions).toHaveBeenCalledWith({ page: 0, size: 10 })

  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(result.current.data).toEqual(samplePage)
})

test('search applies filters and resets page', async () => {
  mockFetchInteractions.mockResolvedValueOnce(samplePage)

  const filteredPage: Page<Interaction> = {
    ...samplePage,
    content: [
      {
        ...samplePage.content[0],
        customerId: 456,
        interactionType: 'EMAIL',
        feedback: 'Follow-up',
      },
    ],
  }

  mockFetchInteractions.mockResolvedValueOnce(filteredPage)

  const { result } = renderHook(() => useInteractions())

  await waitFor(() => expect(mockFetchInteractions).toHaveBeenCalledTimes(1))

  await act(async () => {
    await result.current.search({ customerId: 456, interactionType: 'EMAIL' })
  })

  expect(mockFetchInteractions).toHaveBeenLastCalledWith({
    page: 0,
    size: 10,
    customerId: 456,
    interactionType: 'EMAIL',
  })
  expect(result.current.data).toEqual(filteredPage)
})

test('handles errors gracefully', async () => {
  mockFetchInteractions.mockRejectedValueOnce(new Error('Network failure'))

  const { result } = renderHook(() => useInteractions())

  await waitFor(() => expect(result.current.error).toBe('Network failure'))
  expect(result.current.loading).toBe(false)
})