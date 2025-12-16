import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const LeadLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar role="LEAD" />
        <main className="flex-1 p-8" style={{ marginLeft: '0', width: 'calc(100vw - 320px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LeadLayout