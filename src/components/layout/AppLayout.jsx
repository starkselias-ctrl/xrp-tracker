import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { pathname } = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)' }}>
      <Sidebar />
      <main
        key={pathname}
        className="page-enter"
        style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}
      >
        <Outlet />
      </main>
    </div>
  )
}
