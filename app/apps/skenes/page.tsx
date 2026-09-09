import type { Metadata } from 'next'
import data from './data.json'
import { EraFipChart, VeloChart, HomerZone, PITCH_COLORS } from './charts'

const PAGE_TITLE = 'What Happened to Paul Skenes?'
const PAGE_DESC =
  'A pitch-level Statcast breakdown of Paul Skenes’ 2026 season: why the ERA doubled, what the home runs have in common, and which pitches stopped missing bats.'
const PAGE_URL = 'https://rayzjack.com/apps/skenes'

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | Raymond Jack`,
  description: PAGE_DESC,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESC,
    type: 'article',
    url: PAGE_URL,
    siteName: 'Raymond Jack',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESC,
  },
}

const pct = (v: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`)
const ba = (v: number | null) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''))

function Delta({ now, prior, invert = false, fmt }: { now: number | null; prior: number | null; invert?: boolean; fmt: (v: number) => string }) {
  if (now == null || prior == null) return <span className="skDelta">—</span>
  const diff = now - prior
  const good = invert ? diff < 0 : diff > 0
  const cls = Math.abs(diff) < 1e-9 ? '' : good ? 'skGood' : 'skBad'
  return (
    <span className={`skDelta ${cls}`}>
      {diff > 0 ? '+' : ''}{fmt(diff)}
    </span>
  )
}

export default function SkenesPage() {
  const s2026 = data.seasons.find((s) => s.year === '2026')!
  const s2025 = data.seasons.find((s) => s.year === '2025')!
  const lastStart = data.starts[data.starts.length - 1]
  const arsenal26 = data.arsenal['2026'].filter((a) => a.count >= 20)
  const arsenal25 = new Map(data.arsenal['2025'].map((a) => [a.type, a]))
  const ip26 = Number(s2026.ip.split('.')[0]) + Number(s2026.ip.split('.')[1] ?? 0) / 3
  const ip25 = Number(s2025.ip.split('.')[0]) + Number(s2025.ip.split('.')[1] ?? 0) / 3
  const ff25 = arsenal25.get('FF')!

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
        <span className="skUpdated">Through {lastStart.date} · data via Baseball Savant &amp; MLB Stats API</span>
      </div>

      <article className="wrap prose skDash">
        <h1>{PAGE_TITLE}</h1>
        <p>
          After back-to-back sub-2.00 ERA seasons and the 2025 NL Cy Young, Paul Skenes is sitting on a{' '}
          <strong>{s2026.era} ERA</strong> through {`${data.starts.length} starts`}. This dashboard digs into the
          pitch-level Statcast data for an explanation. The short version: the strikeout stuff is intact and his
          FIP says he&apos;s pitched closer to a {lastStart.cumFip.toFixed(2)}, but he has already blown past last
          season&apos;s full-year home run total, and the fastball has lost a tick.
        </p>

        <div className="skStatRow">
          <div className="skStat">
            <strong>{s2026.era}</strong>
            <span>2026 ERA, vs {s2025.era} in 2025</span>
          </div>
          <div className="skStat">
            <strong>{lastStart.cumFip.toFixed(2)}</strong>
            <span>2026 FIP, so the gap is mostly sequencing and batted-ball luck</span>
          </div>
          <div className="skStat">
            <strong>{((s2026.hr * 9) / ip26).toFixed(2)}</strong>
            <span>HR/9, up from {((s2025.hr * 9) / ip25).toFixed(2)}: {s2026.hr} HR in {s2026.ip} IP after {s2025.hr} in {s2025.ip}</span>
          </div>
          <div className="skStat">
            <strong>{lastStart.ffVelo?.toFixed(1)}</strong>
            <span>avg 4-seam mph last start, vs {ff25.velo} avg in 2025</span>
          </div>
        </div>

        <h2>The ERA says collapse. The FIP says otherwise.</h2>
        <p>
          Cumulative ERA and FIP by start. Opening Day (5 ER in ⅔ of an inning against the Mets) left the ERA at
          67.50 after one start, so the chart begins at start two. From mid-April to mid-June he ran an ERA
          between 2.36 and 3.00. Since then the rough nights have kept coming: seven runs in Philadelphia on
          July 1, five apiece against the Cubs and Reds in late July, five more against the Giants on
          September 1. He has steadied a bit lately, with two scoreless outings in his last five, but the ERA
          line has flattened out well above the FIP line instead of falling back toward it. Red dots mark home
          runs allowed: they cluster in exactly the starts where the ERA line jumps.
        </p>
        <div className="card skChartCard">
          <EraFipChart starts={data.starts} />
        </div>

        <h2>The home runs have a fingerprint</h2>
        <div className="skSplit">
          <div>
            <p>
              All {data.homers.length} home runs, plotted where they crossed the plate. Almost every one is
              middle-in or middle-up, and {data.homers.filter((h) => h.pitchType === 'FF').length} of{' '}
              {data.homers.length} came off the four-seamer, the pitch he throws when he needs a strike. In
              2025 hitters were late on 98-99. At 96-97, the misses over the plate are getting barreled instead
              of fouled off.
            </p>
            <ul className="skHrList">
              {data.homers.map((h, i) => (
                <li key={i}>
                  <span className="skDot" style={{ background: PITCH_COLORS[h.pitchType] ?? '#999' }} />
                  <strong>{h.batter}</strong> · {h.date.slice(5).replace('-', '/')} · {h.pitch.toLowerCase()},{' '}
                  {h.count} count, {h.exitVelo} mph off the bat
                </li>
              ))}
            </ul>
          </div>
          <div className="card skChartCard skZoneCard">
            <HomerZone homers={data.homers} />
          </div>
        </div>

        <h2>The arsenal, 2025 vs 2026</h2>
        <p>
          Whiff rate is down on nearly every pitch. The changeup and slider still miss bats, though hitters are
          doing far more damage on the changeup when they do connect. The sinker&apos;s whiff rate has fallen
          from 15% to 11% and the splitter is getting hit at a .339 clip. The curveball, a real weapon in 2024,
          is basically shelved at under 1% usage.
        </p>
        <table className="skTable">
          <thead>
            <tr>
              <th>Pitch</th>
              <th>Usage</th>
              <th>Velo (mph)</th>
              <th>Whiff%</th>
              <th>BAA</th>
              <th>HR</th>
            </tr>
          </thead>
          <tbody>
            {arsenal26.map((a) => {
              const prev = arsenal25.get(a.type)
              return (
                <tr key={a.type}>
                  <td>
                    <span className="skDot" style={{ background: PITCH_COLORS[a.type] ?? '#999' }} />
                    {a.name}
                  </td>
                  <td>
                    {pct(a.usage)} <Delta now={a.usage} prior={prev?.usage ?? null} fmt={(v) => `${(v * 100).toFixed(1)}pp`} />
                  </td>
                  <td>
                    {a.velo} <Delta now={a.velo} prior={prev?.velo ?? null} fmt={(v) => v.toFixed(1)} />
                  </td>
                  <td>
                    {pct(a.whiffRate)} <Delta now={a.whiffRate} prior={prev?.whiffRate ?? null} fmt={(v) => `${(v * 100).toFixed(1)}pp`} />
                  </td>
                  <td>
                    {ba(a.baa)} <Delta now={a.baa} prior={prev?.baa ?? null} invert fmt={(v) => v.toFixed(3).replace('0.', '.')} />
                  </td>
                  <td>{a.hr}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="skFootnote">
          Usage and velocity deltas vs 2025. Green = improved, red = worse. Whiff% = swinging strikes per swing.
          BAA hidden under 10 at-bats.
        </p>

        <h2>The quiet warning sign: velocity</h2>
        <p>
          Average four-seam velocity by start. He opened the year at 97.9, has sat under 97 in most starts since
          mid-May, and the 95.7 against Miami on August 11 was his lowest of the season, two and a half ticks
          under his 2025 average of {ff25.velo}. It has held between 96.6 and 97.2 in the four starts since, so
          this looks like a step down that stuck rather than a slide that is still going. Nothing here screams
          injury, but it is the one thing on this page that isn&apos;t explained by luck.
        </p>
        <div className="card skChartCard">
          <VeloChart starts={data.starts} avg2025={ff25.velo as number} />
        </div>

        <h2>So what actually happened?</h2>
        <p>
          Three things, in order of importance. <strong>First, home runs:</strong> he has allowed {s2026.hr} in{' '}
          {s2026.ip} innings after allowing {s2025.hr} in {s2025.ip}{' '}all of last year, and they&apos;re
          concentrated on fastballs over the middle. <strong>Second, the blowups:</strong> Opening Day and
          July 1 alone account for 12 of his 66 earned runs, and taking those two out drops his ERA to 3.23.
          That was a cleaner story in June than it is now, though. Eight of his 29 starts have cost him four or
          more earned runs, so this is no longer a case of two bad nights dragging down an otherwise clean
          season. <strong>Third, the stuff is a half-grade duller:</strong>{' '}the fastball is down 1.3 mph and
          whiff rates are down across the arsenal. Not enough to make him bad, but enough to shrink the margin
          for error that made 2025 look easy. The strikeouts are still elite at 10.5 per nine, the walks have
          crept up from 2.0 to 2.6 per nine, and FIP still has him as a top-of-rotation arm. This reads less
          like a decline than
          like a great pitcher having a merely good season, with the home runs doing most of the damage.
        </p>
      </article>

      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
