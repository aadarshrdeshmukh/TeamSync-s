import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-8" style={{ marginLeft: '0', width: 'calc(100vw - 320px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout