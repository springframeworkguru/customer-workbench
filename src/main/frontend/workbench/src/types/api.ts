import type { InteractionType } from './interaction'

export interface InteractionQuery {
  customerId?: number
  productId?: number
  interactionType?: InteractionType
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}
