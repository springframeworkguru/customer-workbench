import { useCallback, useEffect, useState } from 'react'
import { fetchInteractions } from '../services/interactions'
import { getErrorMessage } from '../services/api'
import type { Interaction } from '../types/interaction'
import type { InteractionQuery } from '../types/api'
import type { Page } from '../types/pagination'
import { emptyPage } from '../types/pagination'

const DEFAULT_PAGE_SIZE = 10

export function useInteractions(initialQuery: InteractionQuery = {}) {
  const [data, setData] = useState<Page<Interaction>>(emptyPage(DEFAULT_PAGE_SIZE))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState<InteractionQuery>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    ...initialQuery,
  })

  const load = useCallback(async (nextQuery: InteractionQuery) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchInteractions(nextQuery)
      setData(response)
      setQuery({ ...nextQuery, page: response.number, size: response.size })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const search = async (filters: InteractionQuery) => {
    const normalized = {
      ...query,
      ...filters,
      page: filters.page ?? 0,
      size: filters.size ?? query.size ?? DEFAULT_PAGE_SIZE,
    }
    await load(normalized)
  }

  const setPage = (page: number) => search({ page })

  const refresh = () => load(query)

  return { data, loading, error, search, setPage, query, refresh }
}
