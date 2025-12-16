import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useGetAllTasksQuery, useUpdateTaskMutation } from '../../api/taskApi'
import Card from '../../components/Card'
import KanbanColumn from '../../components/KanbanColumn'
import TaskCard from '../../components/TaskCard'
import Loader from '../../components/Loader'

const AdminTasks = () => {
  const [activeTask, setActiveTask] = useState(null)
  const { data: tasks = [], isLoading, refetch: refetchTasks } = useGetAllTasksQuery()
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
        await updateTask({ id: taskId, status: newStatus }).unwrap()
        refetchTasks()
      } catch (error) {
        console.error('Failed to update task:', error)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        <p className="text-gray-600">Manage all tasks across the system</p>
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">System Task Board</h2>
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
    </div>
  )
}

export default AdminTasks