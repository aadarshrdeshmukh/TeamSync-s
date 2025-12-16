import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useGetMyTasksQuery, useUpdateTaskMutation } from '../../api/taskApi'
import { useGetMyTeamsQuery } from '../../api/teamApi'
import { CheckSquare, CheckCircle, Zap, Calendar } from 'lucide-react'
import Card from '../../components/Card'
import KanbanColumn from '../../components/KanbanColumn'
import TaskCard from '../../components/TaskCard'
import Loader from '../../components/Loader'

const MemberDashboard = () => {
  const [activeTask, setActiveTask] = useState(null)
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useGetMyTasksQuery()
  const { data: teams = [], isLoading: teamsLoading } = useGetMyTeamsQuery()
  const [updateTask] = useUpdateTaskMutation()

  // Configure sensors for better drag detection
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3, // Reduced distance for more responsive drag
    },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  })
  const sensors = useSensors(mouseSensor, touchSensor)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTasks()
    }, 30000)
    return () => clearInterval(interval)
  }, [refetchTasks])

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find(t => t._id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id
    const newStatus = over.id
    const task = tasks.find(t => t._id === taskId)

    if (task && task.status !== newStatus) {
      try {
        // Optimistic update - update UI immediately
        const updatedTasks = tasks.map(t => 
          t._id === taskId ? { ...t, status: newStatus } : t
        )
        
        // Update backend
        await updateTask({ id: taskId, status: newStatus }).unwrap()
        
        // Refetch to ensure consistency
        refetchTasks()
      } catch (error) {
        console.error('Failed to update task:', error)
        // Revert optimistic update on error
        refetchTasks()
      }
    }
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const columns = [
    { id: 'todo', title: 'To Do', tasks: getTasksByStatus('todo') },
    { id: 'in-progress', title: 'In Progress', tasks: getTasksByStatus('in-progress') },
    { id: 'review', title: 'Review', tasks: getTasksByStatus('review') },
    { id: 'completed', title: 'Completed', tasks: getTasksByStatus('completed') },
  ]

  // Calculate metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const activeTasks = tasks.filter(t => ['todo', 'in-progress', 'review'].includes(t.status)).length
  const todaysMeetings = 0 // This would come from meetings API

  // Get assigned tasks (tasks specifically assigned to this user)
  const assignedTasks = tasks.filter(task => task.assignedTo && task.assignedTo._id)

  if (tasksLoading || teamsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600">Track your tasks and team activities</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{assignedTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{todaysMeetings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="My Tasks">
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex space-x-6 overflow-x-auto pb-4">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={column.tasks}
                  />
                ))}
              </div>
              
              <DragOverlay
                dropAnimation={null}
                style={{
                  cursor: 'grabbing',
                }}
              >
                {activeTask ? (
                  <div 
                    className="rotate-2 scale-105 shadow-2xl opacity-95"
                    style={{
                      width: '280px',
                      height: 'auto',
                      transform: 'translate(-140px, -60px)', // Precise offset to center under cursor
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                      zIndex: 1000,
                    }}
                  >
                    <TaskCard task={activeTask} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="My Teams">
            <div className="space-y-3">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <div key={team._id} className="p-4 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                    <h4 className="font-medium text-gray-900">{team.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500 font-medium">
                        {team.members.length} members
                      </span>
                      <span className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${
                        team.status === 'active' 
                          ? 'bg-green-100/60 text-green-800' 
                          : 'bg-gray-100/60 text-gray-800'
                      }`}>
                        {team.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No teams found</p>
              )}
            </div>
          </Card>

          <Card title="Upcoming Deadlines">
            <div className="space-y-3">
              {tasks
                .filter(task => task.status !== 'completed')
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .slice(0, 5)
                .map((task) => (
                  <div key={task._id} className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/30 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full backdrop-blur-sm font-medium ${
                      task.priority === 'urgent' ? 'bg-red-100/60 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100/60 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100/60 text-yellow-800' :
                      'bg-green-100/60 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              {tasks.filter(task => task.status !== 'completed').length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming deadlines</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MemberDashboard