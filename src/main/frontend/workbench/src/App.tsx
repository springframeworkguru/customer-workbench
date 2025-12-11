import './App.css'
import InteractionsPage from './pages/InteractionsPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Customer Workbench</p>
          <h1 className="text-2xl font-semibold">Customer Interactions</h1>
          <p className="text-sm text-slate-600">
            Search and filter customer interaction records served by the Spring MVC backend.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <InteractionsPage />
      </main>
    </div>
  )
}

export default App
