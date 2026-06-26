export type AppPage = 'structure' | 'plates' | 'land'

const PAGES: { id: AppPage; label: string }[] = [
  { id: 'structure', label: 'Internal Structure' },
  { id: 'plates', label: 'Plate Movement' },
  { id: 'land', label: 'Land Through Time' },
]

interface PageNavProps {
  currentPage: AppPage
  onPageChange: (page: AppPage) => void
}

export function PageNav({ currentPage, onPageChange }: PageNavProps) {
  return (
    <nav className="page-nav" aria-label="Projects">
      {PAGES.map((page) => (
        <button
          key={page.id}
          type="button"
          className={`page-nav__tab${currentPage === page.id ? ' page-nav__tab--active' : ''}`}
          aria-current={currentPage === page.id ? 'page' : undefined}
          onClick={() => onPageChange(page.id)}
        >
          {page.label}
        </button>
      ))}
    </nav>
  )
}
