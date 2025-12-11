import { apiClient } from './api'
import type { Interaction } from '../types/interaction'
import type { InteractionQuery } from '../types/api'
import type { Page } from '../types/pagination'

const toParams = (query: InteractionQuery) => {
  const params: Record<string, unknown> = {}

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value
    }
  })

  return params
}

export async function fetchInteractions(query: InteractionQuery): Promise<Page<Interaction>> {
  const params = toParams(query)
  const response = await apiClient.get<Page<Interaction>>('/interactions', { params })
  return response.data
}
