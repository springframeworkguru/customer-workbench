import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useInteractions } from '../hooks/useInteractions'
import type { InteractionType } from '../types/interaction'
import { formatDateTime, truncate } from '../utils/format'

const interactionTypeOptions: { label: string; value: InteractionType }[] = [
  { label: 'Chat', value: 'CHAT' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Ticket', value: 'TICKET' },
  { label: 'Form', value: 'FORM' },
]

const defaultFormState = {
  customerId: '',
  interactionType: '',
  startDate: '',
  endDate: '',
}

function InteractionsPage() {
  const [form, setForm] = useState(defaultFormState)
  const { data, loading, error, search, setPage, refresh } = useInteractions()

  const buildQuery = (page?: number) => ({
    customerId: form.customerId ? Number(form.customerId) : undefined,
    interactionType: form.interactionType ? (form.interactionType as InteractionType) : undefined,
    startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
    endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    page,
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await search(buildQuery(0))
  }

  const handleReset = async () => {
    setForm(defaultFormState)
    await search({ page: 0 })
  }

  const handlePageChange = async (page: number) => {
    await setPage(page)
  }

  const totalElements = data.totalElements ?? 0
  const currentPage = data.totalPages ? data.number + 1 : 0
  const totalPages = data.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Customer Interactions</h1>
          <p className="mt-1 text-sm text-slate-600">Search and filter stored customer interaction records.</p>
        </div>
        <Button variant="secondary" onClick={refresh} disabled={loading} aria-label="Refresh results">
          Refresh
        </Button>
      </div>

      <Card title="Filters">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="customerId">
                Customer ID
              </label>
              <Input
                id="customerId"
                name="customerId"
                inputMode="numeric"
                value={form.customerId}
                onChange={handleChange}
                placeholder="e.g. 42"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="interactionType">
                Interaction type
              </label>
              <Select
                id="interactionType"
                name="interactionType"
                value={form.interactionType}
                onChange={handleChange}
              >
                <option value="">Any</option>
                {interactionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="startDate">
                Start date
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="endDate">
                End date
              </label>
              <Input id="endDate" name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={loading} aria-label="Apply filters">
              Apply filters
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {error && <Alert variant="error" title="Unable to load interactions" description={error} />}

      <Card
        title="Results"
        description={`Showing ${data.content.length} of ${totalElements} record${totalElements === 1 ? '' : 's'}`}
      >
        {loading ? (
          <div className="flex h-32 items-center justify-center text-slate-600">Loading interactions…</div>
        ) : data.content.length === 0 ? (
          <div className="py-6 text-sm text-slate-600">No interactions found for the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="w-40 border-b border-slate-200 px-3 py-2">Timestamp</th>
                  <th className="w-28 border-b border-slate-200 px-3 py-2">Customer ID</th>
                  <th className="w-32 border-b border-slate-200 px-3 py-2">Interaction</th>
                  <th className="border-b border-slate-200 px-3 py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((interaction) => {
                  const message = interaction.feedback ?? interaction.responsesFromCustomerSupport ?? ''
                  return (
                    <tr key={interaction.id ?? `${interaction.customerId}-${interaction.interactionDate}`} className="odd:bg-white even:bg-slate-50">
                      <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-800">{formatDateTime(interaction.interactionDate)}</td>
                      <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-800">{interaction.customerId}</td>
                      <td className="border-b border-slate-100 px-3 py-2 align-top">
                        <Badge variant="info">{interaction.interactionType}</Badge>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">{truncate(message, 120)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={loading || data.first}
              onClick={() => void handlePageChange(Math.max(0, data.number - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading || data.last}
              onClick={() => void handlePageChange(data.number + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default InteractionsPage
