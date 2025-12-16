import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useGetAllTasksQuery, useUpdateTaskMutation } from '../../api/taskApi'
import { useGetAllTeamsQuery } from '../../api/teamApi'
import { Users, CheckSquare, Zap, BarChart3 } from 'lucide-react'
import Card from '../../components/Card'
import KanbanColumn from '../../components/KanbanColumn'
import TaskCard from '../../components/TaskCard'
import Loader from '../../components/Loader'

const AdminDashboard = () => {
  const [activeTask, setActiveTask] = useState(null)
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useGetAllTasksQuery()
  const { data: teams = [], isLoading: teamsLoading } = useGetAllTeamsQuery()
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
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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
        <h1 className="text-2xl font-display font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and task management</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
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
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{activeTasks}</p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="glass-panel p-8">
        <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">System Task Board</h2>
        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
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
      </div>
    </div>
  )
}

export default AdminDashboard