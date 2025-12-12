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

export async function createInteraction(payload: Omit<Interaction, 'id'> | Partial<Interaction>): Promise<Interaction> {
  // Backend accepts application/json for a single interaction
  const response = await apiClient.post<Interaction>('/interactions', payload)
  return response.data
}

export async function uploadCsv(file: File): Promise<{ ingested: number }> {
  const form = new FormData()
  form.append('file', file)

  const response = await apiClient.post<{ ingested: number }>('/interactions', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
