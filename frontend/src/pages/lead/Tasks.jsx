import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useGetMyTasksQuery, useUpdateTaskMutation, useCreateTaskMutation } from '../../api/taskApi'
import { useGetMyTeamsQuery } from '../../api/teamApi'
import { useGetAssignableUsersQuery } from '../../api/userApi'
import { CheckSquare, Zap, CheckCircle, Flame, Plus } from 'lucide-react'
import Card from '../../components/Card'
import KanbanColumn from '../../components/KanbanColumn'
import TaskCard from '../../components/TaskCard'
import Loader from '../../components/Loader'

const LeadTasks = () => {
  const [activeTask, setActiveTask] = useState(null)
  const { data: tasks = [], isLoading, refetch: refetchTasks } = useGetMyTasksQuery()
  const { data: teams = [] } = useGetMyTeamsQuery()
  const { data: users = [] } = useGetAssignableUsersQuery()
  const [updateTask] = useUpdateTaskMutation()
  const [createTask] = useCreateTaskMutation()
  
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
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    teamId: '',
    assignedTo: ''
  })

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
        await updateTask({ id: taskId, status: newStatus }).unwrap()
        refetchTasks()
      } catch (error) {
        console.error('Failed to update task:', error)
        refetchTasks()
      }
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        deadline: formData.deadline,
        teamId: formData.teamId,
        assignedTo: formData.assignedTo || undefined
      }).unwrap()
      setShowCreateModal(false)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
        teamId: '',
        assignedTo: ''
      })
      refetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
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

  // Get team members for selected team
  const selectedTeam = teams.find(team => team._id === formData.teamId)
  const teamMembers = selectedTeam?.members?.map(member => member.userId) || []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Tasks</h1>
          <p className="text-gray-600">Create, assign and track tasks for your teams</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button-primary px-6 py-3"
        >
          Create Task
        </button>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => ['todo', 'in-progress', 'review'].includes(t.status)).length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-metric-card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-gray-700" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter(t => ['urgent', 'high'].includes(t.priority)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Task Board</h2>
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
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input w-full px-3 py-2"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-3 py-2 h-20 resize-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="glass-input w-full px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="glass-input w-full px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  required
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value, assignedTo: '' })}
                  className="glass-input w-full px-3 py-2"
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.teamId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To (Optional)
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="glass-input w-full px-3 py-2"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      title: '',
                      description: '',
                      priority: 'medium',
                      deadline: '',
                      teamId: '',
                      assignedTo: ''
                    })
                  }}
                  className="flex-1 glass-button py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button-primary py-2 px-4"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadTasks