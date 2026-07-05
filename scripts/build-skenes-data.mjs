// Builds app/apps/skenes/data.json from Baseball Savant Statcast and the MLB Stats API.
// Run after each Skenes start: npm run skenes:data
import fs from 'node:fs/promises'
import path from 'node:path'

const PITCHER_ID = 694973
const SEASONS = [2025, 2026]
const FIP_CONSTANT = 3.17
const OUT = path.join(process.cwd(), 'app/apps/skenes/data.json')

const PITCH_NAMES = {
  FF: '4-Seam Fastball',
  SI: 'Sinker',
  FS: 'Splitter',
  SL: 'Slider',
  ST: 'Sweeper',
  CH: 'Changeup',
  CU: 'Curveball',
  KC: 'Knuckle Curve',
  FC: 'Cutter',
}

const SWING = new Set([
  'foul', 'foul_tip', 'hit_into_play', 'swinging_strike',
  'swinging_strike_blocked', 'foul_bunt', 'missed_bunt', 'bunt_foul_tip',
])
const WHIFF = new Set(['swinging_strike', 'swinging_strike_blocked', 'missed_bunt'])
const HIT = new Set(['single', 'double', 'triple', 'home_run'])
const AB = new Set([
  ...HIT, 'strikeout', 'strikeout_double_play', 'field_out',
  'grounded_into_double_play', 'double_play', 'triple_play', 'force_out',
  'fielders_choice', 'fielders_choice_out', 'field_error', 'other_out',
])

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const header = rows[0].map((h) => h.replace(/^﻿/, ''))
  return rows.slice(1).filter((r) => r.length === header.length).map((r) => {
    const o = {}
    header.forEach((h, i) => { o[h] = r[i] })
    return o
  })
}

async function fetchStatcast(season) {
  const url =
    'https://baseballsavant.mlb.com/statcast_search/csv?all=true&type=details' +
    `&player_type=pitcher&pitchers_lookup%5B%5D=${PITCHER_ID}&hfSea=${season}%7C&minors=false`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Statcast ${season}: HTTP ${res.status}`)
  const pitches = parseCsv(await res.text()).filter((p) => p.game_type === 'R')
  console.log(`  ${season}: ${pitches.length} regular-season pitches`)
  return pitches
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res.json()
}

function ipToOuts(ip) {
  const [full, part = '0'] = String(ip).split('.')
  return Number(full) * 3 + Number(part)
}

function arsenal(pitches) {
  const groups = new Map()
  for (const p of pitches) {
    if (!p.pitch_type) continue
    if (!groups.has(p.pitch_type)) groups.set(p.pitch_type, [])
    groups.get(p.pitch_type).push(p)
  }
  const total = pitches.length
  const out = []
  for (const [type, g] of groups) {
    const swings = g.filter((p) => SWING.has(p.description))
    const whiffs = swings.filter((p) => WHIFF.has(p.description))
    const abs = g.filter((p) => AB.has(p.events))
    const hits = g.filter((p) => HIT.has(p.events))
    const hrs = g.filter((p) => p.events === 'home_run')
    const contact = g.filter((p) => p.description === 'hit_into_play' && p.estimated_woba_using_speedangle)
    out.push({
      type,
      name: PITCH_NAMES[type] ?? type,
      count: g.length,
      usage: g.length / total,
      velo: avg(g.map((p) => Number(p.release_speed)).filter(Boolean)),
      whiffRate: swings.length ? whiffs.length / swings.length : null,
      baa: abs.length >= 10 ? hits.length / abs.length : null,
      abs: abs.length,
      hr: hrs.length,
      xwobaContact: contact.length ? avg(contact.map((p) => Number(p.estimated_woba_using_speedangle))) : null,
    })
  }
  return out.sort((a, b) => b.count - a.count)
}

function avg(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null
}

function round(n, d = 3) {
  return n == null ? null : Number(n.toFixed(d))
}

async function main() {
  console.log('Fetching Statcast pitch data…')
  const statcast = {}
  for (const season of SEASONS) statcast[season] = await fetchStatcast(season)

  console.log('Fetching MLB Stats API…')
  const base = `https://statsapi.mlb.com/api/v1/people/${PITCHER_ID}/stats`
  const yearByYear = await fetchJson(`${base}?stats=yearByYear&group=pitching`)
  const gameLog = await fetchJson(`${base}?stats=gameLog&group=pitching&season=2026`)

  const seasons = yearByYear.stats[0].splits.map((s) => ({
    year: s.season,
    era: s.stat.era,
    ip: s.stat.inningsPitched,
    k: s.stat.strikeOuts,
    bb: s.stat.baseOnBalls,
    hr: s.stat.homeRuns,
    whip: s.stat.whip,
    avg: s.stat.avg,
    wins: s.stat.wins,
    losses: s.stat.losses,
    kPer9: s.stat.strikeoutsPer9Inn,
  }))

  // Per-start log with cumulative ERA and FIP
  const veloByDate = new Map()
  for (const p of statcast[2026]) {
    if (p.pitch_type !== 'FF' || !p.release_speed) continue
    if (!veloByDate.has(p.game_date)) veloByDate.set(p.game_date, [])
    veloByDate.get(p.game_date).push(Number(p.release_speed))
  }

  let cum = { outs: 0, er: 0, hr: 0, bb: 0, hbp: 0, k: 0 }
  const starts = gameLog.stats[0].splits.map((s, i) => {
    const st = s.stat
    cum.outs += ipToOuts(st.inningsPitched)
    cum.er += st.earnedRuns
    cum.hr += st.homeRuns
    cum.bb += st.baseOnBalls
    cum.hbp += st.hitByPitch ?? 0
    cum.k += st.strikeOuts
    const ip = cum.outs / 3
    return {
      n: i + 1,
      date: s.date,
      opponent: s.opponent?.abbreviation ?? s.opponent?.name ?? '',
      home: s.isHome,
      ip: st.inningsPitched,
      er: st.earnedRuns,
      k: st.strikeOuts,
      bb: st.baseOnBalls,
      hr: st.homeRuns,
      cumEra: round((cum.er * 9) / ip, 2),
      cumFip: round((13 * cum.hr + 3 * (cum.bb + cum.hbp) - 2 * cum.k) / ip + FIP_CONSTANT, 2),
      ffVelo: round(avg(veloByDate.get(s.date) ?? []), 1),
    }
  })

  // Every 2026 home run allowed
  const homers = statcast[2026]
    .filter((p) => p.events === 'home_run')
    .map((p) => {
      const desMatch = (p.des ?? '').match(/^(.+?)\s+(?:homers|hits a grand slam|hits an inside-the-park home run)/)
      return {
        date: p.game_date,
        batter: desMatch ? desMatch[1] : 'Unknown',
        pitch: PITCH_NAMES[p.pitch_type] ?? p.pitch_type,
        pitchType: p.pitch_type,
        velo: round(Number(p.release_speed), 1),
        exitVelo: round(Number(p.launch_speed), 1),
        distance: p.hit_distance_sc ? Number(p.hit_distance_sc) : null,
        plateX: round(Number(p.plate_x)),
        plateZ: round(Number(p.plate_z)),
        count: `${p.balls}-${p.strikes}`,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  const arsenalByYear = {}
  for (const season of SEASONS) {
    arsenalByYear[season] = arsenal(statcast[season]).map((a) => ({
      ...a,
      usage: round(a.usage),
      velo: round(a.velo, 1),
      whiffRate: round(a.whiffRate),
      baa: round(a.baa),
      xwobaContact: round(a.xwobaContact),
    }))
  }

  const lastGame = starts[starts.length - 1]?.date ?? null
  const data = { updated: new Date().toISOString().slice(0, 10), through: lastGame, seasons, starts, arsenal: arsenalByYear, homers }
  await fs.mkdir(path.dirname(OUT), { recursive: true })
  await fs.writeFile(OUT, JSON.stringify(data, null, 2))
  console.log(`Wrote ${OUT} (${starts.length} starts, ${homers.length} HR, through ${lastGame})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
