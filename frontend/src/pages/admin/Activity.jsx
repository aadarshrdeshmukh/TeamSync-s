import { Activity, BarChart3, Database, Zap, TrendingUp } from 'lucide-react'
import Card from '../../components/Card'

const AdminActivity = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Activity</h1>
        <p className="text-gray-600">Monitor all system activities and user actions</p>
      </div>

      <Card title="Recent System Activity">
        <div className="space-y-4">
          <div className="text-center py-12 text-gray-400">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Activity Feed Coming Soon</p>
            <p className="text-sm">Real-time activity monitoring will be available here</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Activity Statistics">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasks Created Today</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasks Completed Today</span>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Teams Created This Week</span>
              <span className="font-semibold">3</span>
            </div>
          </div>
        </Card>

        <Card title="System Health">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="text-green-600 font-semibold">✓ Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-green-600 font-semibold">45ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="text-blue-600 font-semibold">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-green-600 font-semibold">99.9%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminActivity