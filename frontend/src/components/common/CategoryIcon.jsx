import {
  Cpu, CircuitBoard, Home, Radio, Wifi, Cog, Monitor, Wrench,
} from 'lucide-react'

const MAP = {
  Cpu, CircuitBoard, Home, Radio, Wifi, Cog, Monitor, Wrench,
}

export default function CategoryIcon({ name, size = 20, className = '' }) {
  const Icon = MAP[name] || Cpu
  return <Icon size={size} strokeWidth={1.75} className={className} />
}
