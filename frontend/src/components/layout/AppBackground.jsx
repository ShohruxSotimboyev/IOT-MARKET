import { useTheme } from '../../context/ThemeContext'

export default function AppBackground() {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  if (isLight) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Oq + moviy gradient fon — grid yo'q */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #eef6ff 0%, #f0f7ff 40%, #e8f4fb 70%, #edf2ff 100%)' }} />
        <div className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full opacity-30 blur-[130px]"
          style={{ background: 'radial-gradient(circle, #93c5fd 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] rounded-full opacity-25 blur-[110px]"
          style={{ background: 'radial-gradient(circle, #67e8f9 0%, transparent 70%)' }} />
        <div className="absolute -bottom-[15%] left-[25%] w-[45%] h-[45%] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #a5b4fc 0%, transparent 70%)' }} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#0a0e17]" />
      <div className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full opacity-40 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #0a74da 0%, transparent 70%)' }} />
      <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] rounded-full opacity-35 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #00afa3 0%, transparent 70%)' }} />
      <div className="absolute -bottom-[15%] left-[25%] w-[45%] h-[45%] rounded-full opacity-25 blur-[90px]"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/30 via-transparent to-[#0a0e17]" />
    </div>
  )
}