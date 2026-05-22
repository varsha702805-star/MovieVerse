import { useEffect } from 'react'

function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeStyles = {
    success: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-emerald-950/50',
    error: 'bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-rose-950/50',
    warning: 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-amber-950/50',
    info: 'bg-zinc-900/85 border-blue-500/50 text-blue-300 shadow-blue-950/50',
  }

  const typeIcons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md shadow-2xl transition duration-300 animate-slide-in max-w-sm ${typeStyles[type] || typeStyles.success}`}>
      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-black/30 border border-current/20">
        {typeIcons[type]}
      </span>
      <div className="flex-1 text-sm font-medium tracking-wide pr-2">{message}</div>
      <button onClick={onClose} className="text-current/60 hover:text-current hover:bg-current/10 rounded-lg p-1 transition flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default Toast
