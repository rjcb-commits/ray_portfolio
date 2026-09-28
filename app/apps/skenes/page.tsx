import type { Metadata } from 'next'
import data from './data.json'
import { EraFipChart, VeloChart, HomerZone, PITCH_COLORS } from './charts'

const PAGE_TITLE = 'What Happened to Paul Skenes?'
const PAGE_DESC =
  'A pitch-level Statcast breakdown of Paul Skenes’ 2026 season: a four-seamer down 1.4 mph, 20 home runs after 11, and why the bad-luck explanation stopped holding up.'
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
  const ff26 = data.arsenal['2026'].find((a) => a.type === 'FF')!

  return (
    <main className="appPage">
      <div className="wrap appPageHeader">
        <a href="/" className="backLink">← Back</a>
        <span className="skUpdated">Through {lastStart.date} · data via Baseball Savant &amp; MLB Stats API</span>
      </div>

      <article className="wrap prose skDash">
        <h1>{PAGE_TITLE}</h1>
        <p>
          Skenes won the 2025 Cy Young with a {s2025.era} ERA. He finished 2026 at{' '}
          <strong>{s2026.era}</strong> over {data.starts.length}{' '}starts. I pulled every pitch from both
          seasons off Statcast to see what changed. It is the home runs. He gave up {s2026.hr} this year after
          giving up {s2025.hr} all of last season, and{' '}
          {data.homers.filter((h) => h.pitchType === 'FF').length}{' '}of them came off a four-seamer that lost
          1.4 mph. The strikeouts never went anywhere.
        </p>

        <div className="skStatRow">
          <div className="skStat">
            <strong>{s2026.era}</strong>
            <span>2026 ERA, vs {s2025.era} in 2025</span>
          </div>
          <div className="skStat">
            <strong>{lastStart.cumFip.toFixed(2)}</strong>
            <span>2026 FIP, up from 2.80 in late May as the home runs piled up</span>
          </div>
          <div className="skStat">
            <strong>{((s2026.hr * 9) / ip26).toFixed(2)}</strong>
            <span>HR/9, up from {((s2025.hr * 9) / ip25).toFixed(2)}: {s2026.hr} HR in {s2026.ip} IP after {s2025.hr} in {s2025.ip}</span>
          </div>
          <div className="skStat">
            <strong>{ff26.velo?.toFixed(1)}</strong>
            <span>avg 4-seam mph in 2026, down from {ff25.velo} in 2025</span>
          </div>
        </div>

        <h2>I thought this was bad luck. It wasn&apos;t.</h2>
        <p>
          Cumulative ERA and FIP by start. Opening Day was five runs in two-thirds of an inning against the
          Mets, which put his ERA at 67.50, so the chart starts at his second outing. Through May the two lines
          sat almost on top of each other. Then the ERA pulled away: seven runs in Philadelphia on July 1, five
          each against the Cubs and Reds later that month. By early August it was running a full run ahead of
          the FIP, which is the kind of gap that usually closes on its own.
        </p>
        <p>
          It closed from the wrong direction. The FIP came up to meet the ERA instead, climbing from 2.80 in
          late May to {lastStart.cumFip.toFixed(2)} at the finish, and the gap shrank to{' '}
          {(lastStart.cumEra - lastStart.cumFip).toFixed(2)}. FIP counts home runs, and the home runs never
          stopped. Six of them came in September alone. Red dots mark them on the chart, and they land on the
          same starts where the ERA jumps.
        </p>
        <div className="card skChartCard">
          <EraFipChart starts={data.starts} />
        </div>

        <h2>The home runs have a fingerprint</h2>
        <div className="skSplit">
          <div>
            <p>
              All {data.homers.length} home runs, plotted where they crossed the plate. Almost all of them are
              middle-in or middle-up, and {data.homers.filter((h) => h.pitchType === 'FF').length} of{' '}
              {data.homers.length}{' '}came off the four-seamer, which is the pitch he goes to when he needs a
              strike. He gave up 5 on that pitch in all of 2025. Last year hitters were late on 98 and 99. At
              96 and 97 they aren&apos;t late anymore, and the last five he gave up were all four-seamers.
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
          Whiff rate is down on almost everything. The changeup and slider still miss bats, but hitters did a
          lot more damage on the changeup when they got to it, .233 against after .103. The sinker went from
          15% whiffs to 12%. The splitter got hit at .323. The curveball was a real weapon in 2024 and he has
          basically stopped throwing it. The four-seamer is the strange one. Hitters swung and missed at it
          slightly more often than last year and batted just .220 against it, but the home runs off it went
          from 5 to 13. They were not hitting it more. They were hitting it farther.
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

        <h2>Velocity</h2>
        <p>
          Average four-seam velocity by start. He opened at 97.9 and never got back there. From mid-May on he
          was under 97 in most starts, and the 95.7 against Miami on August 11 was his low for the year, two
          and a half ticks off his 2025 average of {ff25.velo}. He finished the season at {ff26.velo} on
          average, 1.4 below last year. It stepped down in May and stayed down for four months, which is a
          long time to call it a blip. Nothing that looks like an injury, but this is the number the rest of
          the page keeps pointing back to.
        </p>
        <div className="card skChartCard">
          <VeloChart starts={data.starts} avg2025={ff25.velo as number} />
        </div>

        <h2>So what actually happened?</h2>
        <p>
          The home runs. {s2026.hr} in {s2026.ip} innings after {s2025.hr} in {s2025.ip}{' '}last year, mostly
          on four-seamers over the middle of the plate. Everything else on this page is either downstream of
          that or beside the point.
        </p>
        <p>
          The blowups look smaller than they did in July. Opening Day and the July 1 game in Philadelphia are
          12 of his 74 earned runs, and pulling both drops his ERA to 3.29, which is not the rescue it sounded
          like at the time. Nine of his {data.starts.length} starts cost him four runs or more. That is a
          pattern, not a couple of bad nights.
        </p>
        <p>
          What did not change is worth saying too. He struck out{' '}
          {((s2026.k * 9) / ip26).toFixed(1)} per nine, the same as last year. He walked{' '}
          {((s2026.bb * 9) / ip26).toFixed(1)}, up a little from{' '}
          {((s2025.bb * 9) / ip25).toFixed(1)}. He was healthy enough to make {data.starts.length} starts and
          throw {s2026.ip} innings. This is not a pitcher coming apart.
        </p>
        <p>
          The honest read is narrower and less dramatic than the one I started with. He lost 1.4 mph off the
          fastball, hitters stopped being late on it, and the extra home runs turned a 2.00 ERA into a 3.80
          one. That is the whole story. I spent most of the summer calling it bad luck because the FIP was a
          run below the ERA, and then the FIP climbed to {lastStart.cumFip.toFixed(2)} and took the argument
          with it.
        </p>
      </article>

      <footer className="footer wrap">
        <div>© {new Date().getFullYear()} Raymond Jack</div>
        <div className="footerMeta">Built with Next.js</div>
      </footer>
    </main>
  )
}
