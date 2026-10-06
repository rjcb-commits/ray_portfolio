'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  title: string
  // Fixed size of the published dashboard, including Tableau's footer bar
  width: number
  height: number
}

// Renders a fixed-size Tableau dashboard at full size and scales it down to fit
// the container, so the whole dashboard shows without scroll bars.
export default function ScaledTableauEmbed({ src, title, width, height }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const update = () => setScale(Math.min(1, box.clientWidth / width))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(box)
    return () => observer.disconnect()
  }, [width])

  return (
    <div
      ref={boxRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: width,
        aspectRatio: `${width} / ${height}`,
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px solid var(--border)',
      }}
    >
      <iframe
        src={src}
        title={title}
        width={width}
        height={height}
        scrolling="no"
        allow="fullscreen"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      />
    </div>
  )
}
