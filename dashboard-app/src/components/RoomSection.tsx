import { type ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  columns?: 2 | 3
}

export function RoomSection({ title, children, columns = 2 }: Props) {
  return (
    <div>
      <h2 className="text-xs text-white/35 uppercase tracking-widest font-bold mb-2 px-1">
        {title}
      </h2>
      <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
        {children}
      </div>
    </div>
  )
}
