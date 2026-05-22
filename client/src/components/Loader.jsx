function Loader() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-red-400 animate-spin" style={{ animationDuration: '0.6s' }}></div>
      </div>
      <p className="text-zinc-500 mt-6 text-sm font-semibold tracking-widest uppercase">Loading</p>
    </div>
  )
}

export default Loader