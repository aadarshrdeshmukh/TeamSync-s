import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

const KanbanColumn = ({ id, title, tasks, onTaskUpdate }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={`flex-1 min-w-80 glass-column p-6 transition-all duration-300 ${isOver ? 'bg-white/50 border-gray-400/60 shadow-xl' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-white/60 text-gray-700 text-sm px-3 py-1 rounded-full backdrop-blur-sm font-medium">
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="space-y-3 min-h-96">
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={onTaskUpdate}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No tasks in {title.toLowerCase()}</p>
            {isOver && <p className="text-xs text-gray-700 mt-2 font-medium">Drop task here</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanColumn