import { useEffect, useState } from 'react'
import { PageNav, type AppPage } from './components/PageNav'
import { LandTimelinePage } from './pages/LandTimelinePage'
import { PlateTimelinePage } from './pages/PlateTimelinePage'
import { StructurePage } from './pages/StructurePage'
import './App.css'

export type { AppPage }

const PAGE_META: Record<AppPage, { title: string; subtitle: string }> = {
  structure: {
    title: 'Earth Internal Structure',
    subtitle: 'Interactive 3D cross-section',
  },
  plates: {
    title: 'Plate Movement Timeline',
    subtitle: 'Explore tectonic drift through geological time',
  },
  land: {
    title: 'Land Through Time',
    subtitle: 'Watch continents and coastlines shift across geological eras',
  },
}

function App() {
  const [page, setPage] = useState<AppPage>('structure')
  const [loaded, setLoaded] = useState(false)

  const meta = PAGE_META[page]

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 100)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className={`app${loaded ? ' app--loaded' : ''}`}>
      <header className="app-header">
        <div className="app-header__title">
          <h1>{meta.title}</h1>
          <p>{meta.subtitle}</p>
        </div>
        <PageNav currentPage={page} onPageChange={setPage} />
      </header>

      <div hidden={page !== 'structure'}>
        <StructurePage />
      </div>
      <div hidden={page !== 'plates'}>
        <PlateTimelinePage />
      </div>
      <div hidden={page !== 'land'}>
        <LandTimelinePage />
      </div>
    </div>
  )
}

export default App
