const Card = ({ title, children, className = '', headerAction = null }) => {
  return (
    <div className={`glass-card p-8 ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h3>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card