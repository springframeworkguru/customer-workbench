import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useInteractions } from '../hooks/useInteractions'
import { createInteraction, uploadCsv } from '../services/interactions'
import type { Interaction } from '../types/interaction'
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
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Dialog state for creating a single interaction
  const [showDialog, setShowDialog] = useState(false)
  const [createForm, setCreateForm] = useState({
    productId: '',
    customerId: '',
    interactionType: 'CHAT' as InteractionType | '',
    customerRating: '',
    feedback: '',
    interactionDate: '',
    responsesFromCustomerSupport: '',
  })

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
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setShowDialog(true)} aria-label="New interaction">
            New
          </Button>
          <Button variant="secondary" onClick={refresh} disabled={loading} aria-label="Refresh results">
            Refresh
          </Button>
        </div>
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

      {/* Upload section */}
      <Card title="Upload data" description="Upload a JSON file with a single interaction, or a CSV file with multiple rows.">
        {notice && <Alert variant="info" title="Success" description={notice} />}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="jsonUpload" className="text-sm font-medium text-slate-700">
              JSON upload
            </label>
            <input
              id="jsonUpload"
              type="file"
              accept="application/json,.json"
              aria-label="Upload JSON file"
              onChange={async (e) => {
                const inputEl = e.currentTarget
                const file = inputEl.files?.[0]
                if (!file) return
                try {
                  setBusy(true)
                  const text = await file.text()
                  const obj = JSON.parse(text) as Partial<Interaction>
                  // Coerce types if coming as strings
                  const payload: Partial<Interaction> = {
                    ...obj,
                    productId: obj.productId != null ? Number(obj.productId) : undefined,
                    customerId: obj.customerId != null ? Number(obj.customerId) : undefined,
                    customerRating:
                      obj.customerRating === null || obj.customerRating === undefined
                        ? undefined
                        : Number(obj.customerRating),
                  }
                  await createInteraction(payload)
                  setNotice('JSON interaction uploaded.')
                  await refresh()
                } catch (err) {
                  setNotice(null)
                  // Reuse error alert section below by setting error-like notice
                  // but we keep it simple: show inline browser alert
                  // eslint-disable-next-line no-alert
                  alert('Failed to upload JSON: ' + (err as Error).message)
                } finally {
                  setBusy(false)
                  // reset the input value so the same file can be selected again
                  inputEl.value = ''
                }
              }}
              disabled={busy}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="csvUpload" className="text-sm font-medium text-slate-700">
              CSV upload
            </label>
            <input
              id="csvUpload"
              type="file"
              accept="text/csv,.csv"
              aria-label="Upload CSV file"
              onChange={async (e) => {
                const inputEl = e.currentTarget
                const file = inputEl.files?.[0]
                if (!file) return
                try {
                  setBusy(true)
                  const { ingested } = await uploadCsv(file)
                  setNotice(`${ingested} record${ingested === 1 ? '' : 's'} ingested from CSV.`)
                  await refresh()
                } catch (err) {
                  setNotice(null)
                  // eslint-disable-next-line no-alert
                  alert('Failed to upload CSV: ' + (err as Error).message)
                } finally {
                  setBusy(false)
                  inputEl.value = ''
                }
              }}
              disabled={busy}
            />
          </div>
        </div>
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
                  <th className="w-[28rem] border-b border-slate-200 px-3 py-2">Customer Message</th>
                  <th className="w-[28rem] border-b border-slate-200 px-3 py-2">Support Message</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((interaction) => (
                  <tr
                    key={interaction.id ?? `${interaction.customerId}-${interaction.interactionDate}`}
                    className="odd:bg-white even:bg-slate-50"
                  >
                    <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-800">
                      {formatDateTime(interaction.interactionDate)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-800">
                      {interaction.customerId}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top">
                      <Badge variant="info">{interaction.interactionType}</Badge>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">
                      {truncate(interaction.feedback ?? '', 120)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">
                      {truncate(interaction.responsesFromCustomerSupport ?? '', 120)}
                    </td>
                  </tr>
                ))}
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

      {/* Simple modal dialog for creating an interaction */}
      {showDialog && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDialog(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-md bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">New Interaction</h2>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  setBusy(true)
                  const payload: Partial<Interaction> = {
                    productId: createForm.productId ? Number(createForm.productId) : undefined,
                    customerId: createForm.customerId ? Number(createForm.customerId) : undefined,
                    interactionType: (createForm.interactionType || 'CHAT') as InteractionType,
                    customerRating: createForm.customerRating ? Number(createForm.customerRating) : undefined,
                    feedback: createForm.feedback || undefined,
                    interactionDate: createForm.interactionDate
                      ? new Date(createForm.interactionDate).toISOString()
                      : new Date().toISOString(),
                    responsesFromCustomerSupport: createForm.responsesFromCustomerSupport || undefined,
                  }
                  await createInteraction(payload)
                  setShowDialog(false)
                  setCreateForm({
                    productId: '',
                    customerId: '',
                    interactionType: 'CHAT',
                    customerRating: '',
                    feedback: '',
                    interactionDate: '',
                    responsesFromCustomerSupport: '',
                  })
                  setNotice('Interaction created successfully.')
                  await refresh()
                } catch (err) {
                  // eslint-disable-next-line no-alert
                  alert('Failed to create interaction: ' + (err as Error).message)
                } finally {
                  setBusy(false)
                }
              }}
            >
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-productId">
                  Product ID
                </label>
                <Input
                  id="ci-productId"
                  name="productId"
                  value={createForm.productId}
                  onChange={(e) => setCreateForm((s) => ({ ...s, productId: e.target.value }))}
                  inputMode="numeric"
                  placeholder="e.g. 1001"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-customerId">
                  Customer ID
                </label>
                <Input
                  id="ci-customerId"
                  name="customerId"
                  value={createForm.customerId}
                  onChange={(e) => setCreateForm((s) => ({ ...s, customerId: e.target.value }))}
                  inputMode="numeric"
                  placeholder="e.g. 42"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-type">
                  Interaction Type
                </label>
                <Select
                  id="ci-type"
                  name="interactionType"
                  value={createForm.interactionType}
                  onChange={(e) => setCreateForm((s) => ({ ...s, interactionType: e.target.value as InteractionType }))}
                >
                  {interactionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-rating">
                  Customer Rating
                </label>
                <Input
                  id="ci-rating"
                  name="customerRating"
                  inputMode="numeric"
                  value={createForm.customerRating}
                  onChange={(e) => setCreateForm((s) => ({ ...s, customerRating: e.target.value }))}
                  placeholder="1-5"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-feedback">
                  Customer Message
                </label>
                <Input
                  id="ci-feedback"
                  name="feedback"
                  value={createForm.feedback}
                  onChange={(e) => setCreateForm((s) => ({ ...s, feedback: e.target.value }))}
                  placeholder="What did the customer say?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-date">
                  Timestamp
                </label>
                <Input
                  id="ci-date"
                  name="interactionDate"
                  type="datetime-local"
                  value={createForm.interactionDate}
                  onChange={(e) => setCreateForm((s) => ({ ...s, interactionDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="ci-support">
                  Support Message
                </label>
                <Input
                  id="ci-support"
                  name="responsesFromCustomerSupport"
                  value={createForm.responsesFromCustomerSupport}
                  onChange={(e) =>
                    setCreateForm((s) => ({ ...s, responsesFromCustomerSupport: e.target.value }))
                  }
                  placeholder="What did support reply?"
                />
              </div>
              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={busy} aria-label="Create interaction">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractionsPage
