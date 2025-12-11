export type InteractionType = 'CHAT' | 'EMAIL' | 'TICKET' | 'FORM'

export interface Interaction {
  id: number
  productId: number
  customerId: number
  interactionType: InteractionType
  customerRating?: number | null
  feedback?: string | null
  interactionDate: string
  responsesFromCustomerSupport?: string | null
}
