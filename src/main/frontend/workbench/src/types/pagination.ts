export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export const emptyPage = <T>(size = 10): Page<T> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size,
  first: true,
  last: true,
  empty: true,
})
