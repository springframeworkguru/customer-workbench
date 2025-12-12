import { apiClient } from './api'
import { createInteraction, fetchInteractions, uploadCsv } from './interactions'

jest.mock('./api', () => {
  const get = jest.fn()
  const post = jest.fn()
  return { apiClient: { get, post } }
})

describe('interactions service', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('fetchInteractions forwards query params', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({ data: { content: [], number: 0, size: 10, totalPages: 0, totalElements: 0 } })

    const result = await fetchInteractions({ customerId: 42, interactionType: 'EMAIL', page: 0, size: 10 })

    expect(apiClient.get).toHaveBeenCalledWith('/interactions', {
      params: expect.objectContaining({ customerId: 42, interactionType: 'EMAIL', page: 0, size: 10 }),
    })
    expect(result.number).toBe(0)
  })

  test('createInteraction posts JSON body', async () => {
    const payload = { productId: 1, customerId: 2, interactionType: 'CHAT' as const, interactionDate: new Date().toISOString() }
    ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 99, ...payload } })

    const created = await createInteraction(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/interactions', payload)
    expect(created.id).toBe(99)
  })

  test('uploadCsv posts multipart/form-data', async () => {
    ;(apiClient.post as jest.Mock).mockResolvedValue({ data: { ingested: 3 } })
    const file = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' })

    const result = await uploadCsv(file)

    const [url, body, config] = (apiClient.post as jest.Mock).mock.calls[0]
    expect(url).toBe('/interactions')
    expect(body).toBeInstanceOf(FormData)
    expect(config.headers['Content-Type']).toBe('multipart/form-data')
    expect(result.ingested).toBe(3)
  })
})
