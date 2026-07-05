// Static SVG charts for the Skenes dashboard. Server components, no chart library.
import data from './data.json'

type Start = (typeof data.starts)[number]
type Homer = (typeof data.homers)[number]

export const PITCH_COLORS: Record<string, string> = {
  FF: '#0a2540',
  SI: '#7c9cbf',
  ST: '#c2703d',
  CH: '#6b8f71',
  SL: '#8a6bbf',
  FS: '#b8860b',
  CU: '#999999',
}

const AXIS = { fontSize: 11, fill: '#737373' }

function scale(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain
  const [r0, r1] = range
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
}

function linePath(points: [number, number][]) {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

// Cumulative ERA vs FIP by start. Start 1 (5 ER in 0.2 IP) sends cumulative
// ERA to 67.5, so the x-axis begins at start 2.
export function EraFipChart({ starts }: { starts: Start[] }) {
  const shown = starts.filter((s) => s.n >= 2)
  const w = 640
  const h = 300
  const pad = { l: 40, r: 96, t: 16, b: 32 }
  const x = scale([2, starts.length], [pad.l, w - pad.r])
  const yMax = Math.ceil(Math.max(...shown.map((s) => s.cumEra)) + 0.5)
  const y = scale([0, yMax], [h - pad.b, pad.t])

  const era = shown.map((s) => [x(s.n), y(s.cumEra)] as [number, number])
  const fip = shown.map((s) => [x(s.n), y(s.cumFip)] as [number, number])
  const last = shown[shown.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Cumulative ERA versus FIP by start">
      {Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2).map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="rgba(10,10,10,0.07)" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" {...AXIS}>{v}</text>
        </g>
      ))}
      {shown.filter((s) => s.n % 4 === 2 || s.n === starts.length).map((s) => (
        <text key={s.n} x={x(s.n)} y={h - pad.b + 18} textAnchor="middle" {...AXIS}>
          {s.date.slice(5).replace('-', '/')}
        </text>
      ))}
      {/* HR ticks along the bottom */}
      {shown.filter((s) => s.hr > 0).map((s) => (
        <g key={`hr${s.n}`}>
          {Array.from({ length: s.hr }, (_, i) => (
            <circle key={i} cx={x(s.n)} cy={h - pad.b - 5 - i * 8} r={2.5} fill="#b3402e" opacity={0.75}>
              <title>{`${s.date}: ${s.hr} HR allowed vs ${s.opponent}`}</title>
            </circle>
          ))}
        </g>
      ))}
      <path d={linePath(fip)} fill="none" stroke="#999999" strokeWidth={2} strokeDasharray="5 4" />
      <path d={linePath(era)} fill="none" stroke="#0a2540" strokeWidth={2.5} />
      {shown.map((s) => (
        <circle key={s.n} cx={x(s.n)} cy={y(s.cumEra)} r={3.5} fill="#0a2540">
          <title>{`Start ${s.n} · ${s.date} vs ${s.opponent}: ${s.ip} IP, ${s.er} ER. Season ERA ${s.cumEra}, FIP ${s.cumFip}`}</title>
        </circle>
      ))}
      <text x={x(last.n) + 10} y={y(last.cumEra) + 4} fontSize={12} fontWeight={600} fill="#0a2540">
        ERA {last.cumEra.toFixed(2)}
      </text>
      <text x={x(last.n) + 10} y={y(last.cumFip) + 4} fontSize={12} fill="#737373">
        FIP {last.cumFip.toFixed(2)}
      </text>
      <text x={pad.l} y={h - pad.b - 8} {...AXIS} fill="#b3402e">• HR allowed</text>
    </svg>
  )
}

// Four-seam velocity by start against the prior-season average.
export function VeloChart({ starts, avg2025 }: { starts: Start[]; avg2025: number }) {
  const pts = starts.filter((s) => s.ffVelo != null)
  const w = 640
  const h = 220
  const pad = { l: 44, r: 96, t: 18, b: 30 }
  const values = pts.map((s) => s.ffVelo as number)
  const yMin = Math.floor(Math.min(...values, avg2025) - 0.4)
  const yMax = Math.ceil(Math.max(...values, avg2025) + 0.4)
  const x = scale([1, pts.length], [pad.l, w - pad.r])
  const y = scale([yMin, yMax], [h - pad.b, pad.t])
  const line = pts.map((s, i) => [x(i + 1), y(s.ffVelo as number)] as [number, number])
  const lastPt = line[line.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Four-seam fastball velocity by start">
      {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="rgba(10,10,10,0.07)" />
          <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" {...AXIS}>{v}</text>
        </g>
      ))}
      {pts.filter((_, i) => (i % 4 === 0 && pts.length - 1 - i >= 3) || i === pts.length - 1).map((s) => (
        <text key={s.n} x={x(pts.indexOf(s) + 1)} y={h - pad.b + 18} textAnchor="middle" {...AXIS}>
          {s.date.slice(5).replace('-', '/')}
        </text>
      ))}
      <line x1={pad.l} x2={w - pad.r} y1={y(avg2025)} y2={y(avg2025)} stroke="#b3402e" strokeDasharray="5 4" strokeWidth={1.5} />
      <text x={w - pad.r + 8} y={y(avg2025) + 4} fontSize={11.5} fill="#b3402e">2025 avg {avg2025}</text>
      <path d={linePath(line)} fill="none" stroke="#0a2540" strokeWidth={2.5} />
      {pts.map((s, i) => (
        <circle key={s.n} cx={x(i + 1)} cy={y(s.ffVelo as number)} r={3.5} fill="#0a2540">
          <title>{`Start ${s.n} · ${s.date} vs ${s.opponent}: ${s.ffVelo} mph avg 4-seam`}</title>
        </circle>
      ))}
      <text x={lastPt[0] + 10} y={lastPt[1] + 4} fontSize={12} fontWeight={600} fill="#0a2540">
        {values[values.length - 1].toFixed(1)}
      </text>
    </svg>
  )
}

// Every 2026 home run plotted on the strike zone, catcher's view.
export function HomerZone({ homers }: { homers: Homer[] }) {
  const w = 320
  const h = 340
  const x = scale([-1.6, 1.6], [10, w - 10])
  const y = scale([0.6, 4.4], [h - 30, 10])
  const zone = { x1: x(-0.83), x2: x(0.83), y1: y(3.5), y2: y(1.5) }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Home run locations, catcher's view">
      <rect
        x={zone.x1} y={zone.y1} width={zone.x2 - zone.x1} height={zone.y2 - zone.y1}
        fill="rgba(10,37,64,0.04)" stroke="rgba(10,10,10,0.25)" strokeWidth={1.5}
      />
      {/* zone thirds */}
      {[1 / 3, 2 / 3].map((f) => (
        <g key={f}>
          <line x1={zone.x1 + (zone.x2 - zone.x1) * f} x2={zone.x1 + (zone.x2 - zone.x1) * f} y1={zone.y1} y2={zone.y2} stroke="rgba(10,10,10,0.1)" />
          <line x1={zone.x1} x2={zone.x2} y1={zone.y1 + (zone.y2 - zone.y1) * f} y2={zone.y1 + (zone.y2 - zone.y1) * f} stroke="rgba(10,10,10,0.1)" />
        </g>
      ))}
      {/* home plate */}
      <path
        d={`M${x(-0.7)},${h - 22} L${x(0.7)},${h - 22} L${x(0.7)},${h - 16} L${x(0)},${h - 8} L${x(-0.7)},${h - 16} Z`}
        fill="none" stroke="rgba(10,10,10,0.25)"
      />
      {homers.map((hr, i) => (
        <circle key={i} cx={x(hr.plateX)} cy={y(hr.plateZ)} r={8} fill={PITCH_COLORS[hr.pitchType] ?? '#999'} opacity={0.85} stroke="#fff" strokeWidth={1.5}>
          <title>{`${hr.date} · ${hr.batter} off a ${hr.velo} mph ${hr.pitch.toLowerCase()} (${hr.count} count), ${hr.exitVelo} mph exit velo`}</title>
        </circle>
      ))}
      <text x={w / 2} y={h - 0} textAnchor="middle" {...AXIS}>catcher&apos;s view</text>
    </svg>
  )
}
