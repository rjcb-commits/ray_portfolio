'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

type Puzzle = { givens: string; solution: string }

// 32 clues each, the count Niner uses for Classic Medium. Every puzzle has a unique solution.
const PUZZLES: Puzzle[] = [
  { givens: '809000310010083000000500020000037258000090000205000943000374000480000030023908460',
    solution: '869742315512683794734519826691437258348295671275861943956374182487126539123958467' },
  { givens: '704593000000006270000102003209000060106004890050809700040050008000308040060047000',
    solution: '724593186531486279698172453289715364176234895453869712347651928915328647862947531' },
  { givens: '601072905000090000000001080000607020900504008142000000000240076026080501700106040',
    solution: '681472935374895162259361784835617429967524318142938657513249876426783591798156243' },
  { givens: '905480010001050760300070009008090003000032070030104008000500031100647000020000490',
    solution: '975486312281953764364271589618795243459832176732164958847529631193647825526318497' },
  { givens: '000902005090000030000030000605000400040006318908170500709260040300809000021057090',
    solution: '183942765496785132572631984615328479247596318938174526759263841364819257821457693' },
  { givens: '000062140102008005000073000000080070840035609000000500280300097090840260030007800',
    solution: '973562148162498735458173926519684372847235619326719584281356497795841263634927851' },
]

const MISTAKE_LIMIT = 3
const LINES = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-9px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(-2px)' },
  { transform: 'translateX(0)' },
]
const PULSE: Keyframe[] = [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }]
const WIN: Keyframe[] = [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }]

const parse = (s: string) => s.split('').map(Number)

function formatTime(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function NinerDemo({ playUrl }: { playUrl: string }) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [board, setBoard] = useState(() => parse(PUZZLES[0].givens))
  const [selected, setSelected] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [missedDigit, setMissedDigit] = useState<number | null>(null)
  const [rejections, setRejections] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [started, setStarted] = useState(false)

  const boardRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])

  const givens = useMemo(() => parse(PUZZLES[puzzleIdx].givens), [puzzleIdx])
  const solution = useMemo(() => parse(PUZZLES[puzzleIdx].solution), [puzzleIdx])
  const won = board.every((v, i) => v === solution[i])
  const lost = mistakes >= MISTAKE_LIMIT
  const finished = won || lost
  const selectedValue = selected == null ? 0 : board[selected]

  const remaining = useMemo(() => {
    const left = Array<number>(10).fill(9)
    for (const v of board) if (v) left[v]--
    return left
  }, [board])

  useEffect(() => {
    if (!started || finished) return
    const id = window.setInterval(() => {
      if (!document.hidden) setElapsed((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [started, finished])

  useEffect(() => {
    if (rejections === 0 || reducedMotion()) return
    boardRef.current?.animate(SHAKE, { duration: 320, easing: 'ease-out' })
    counterRef.current?.animate(PULSE, { duration: 280, easing: 'ease-out' })
  }, [rejections])

  useEffect(() => {
    if (!won || reducedMotion()) return
    boardRef.current?.animate(WIN, { duration: 660, easing: 'ease-in-out' })
  }, [won])

  const selectCell = (i: number) => {
    setSelected(i)
    setMissedDigit(null)
    setStarted(true)
  }

  const enter = (value: number) => {
    if (selected == null || finished || givens[selected] !== 0) return
    if (board[selected] === value) return
    setStarted(true)
    // Like the app, a wrong digit is never written to the board. It only costs a mistake.
    if (value !== 0 && value !== solution[selected]) {
      setMistakes((m) => m + 1)
      setMissedDigit(value)
      setRejections((n) => n + 1)
      return
    }
    setMissedDigit(null)
    const idx = selected
    setBoard((b) => b.map((v, i) => (i === idx ? value : v)))
  }

  const move = (dr: number, dc: number) => {
    let next = 40
    if (selected != null) {
      const r = Math.min(8, Math.max(0, Math.floor(selected / 9) + dr))
      const c = Math.min(8, Math.max(0, (selected % 9) + dc))
      next = r * 9 + c
    }
    selectCell(next)
    cellRefs.current[next]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (/^[1-9]$/.test(e.key)) enter(Number(e.key))
    else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') enter(0)
    else if (e.key in ARROWS) move(...ARROWS[e.key])
    else return
    e.preventDefault()
  }

  const newPuzzle = () => {
    const next = (puzzleIdx + 1) % PUZZLES.length
    setPuzzleIdx(next)
    setBoard(parse(PUZZLES[next].givens))
    setSelected(null)
    setMistakes(0)
    setMissedDigit(null)
    setElapsed(0)
    setStarted(false)
  }

  const cellClass = (i: number) => {
    const r = Math.floor(i / 9)
    const c = i % 9
    const cls = ['ndCell']
    if (board[i] && !givens[i]) cls.push('user')
    if (c === 2 || c === 5) cls.push('boxR')
    if (r === 2 || r === 5) cls.push('boxB')
    if (i === selected) cls.push('selected')
    else if (selectedValue && board[i] === selectedValue) cls.push('same')
    else if (selected != null) {
      const sr = Math.floor(selected / 9)
      const sc = selected % 9
      const sameBox = Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3)
      if (r === sr || c === sc || sameBox) cls.push('peer')
    }
    return cls.join(' ')
  }

  const cellLabel = (i: number) => {
    const v = board[i]
    const state = !v ? 'empty' : givens[i] ? `given ${v}` : String(v)
    return `Row ${Math.floor(i / 9) + 1}, column ${(i % 9) + 1}, ${state}`
  }

  const status = won
    ? `Solved in ${formatTime(elapsed)} with ${mistakes} ${mistakes === 1 ? 'mistake' : 'mistakes'}.`
    : lost
      ? 'Out of mistakes. Start a new puzzle to try again.'
      : missedDigit != null
        ? `That ${missedDigit} doesn't go there. Mistake ${mistakes} of ${MISTAKE_LIMIT}.`
        : selected == null
          ? 'Select a cell, then type a digit or tap the pad.'
          : 'Wrong digits never land on the board. Three mistakes and the game is over.'

  const canErase = !finished && selected != null && givens[selected] === 0 && board[selected] !== 0

  return (
    <section className="ninerDemo wrap" aria-labelledby="niner-demo-title">
      <div className="ndCard" onKeyDown={onKeyDown}>
        <div className="ndHead">
          <div className="sectionLabel">Try it</div>
          <h2 id="niner-demo-title" className="ndTitle">Play a web port of Niner</h2>
          <p className="ndLede">
            A stripped-down web version of the core game, using Classic rules on Medium. The{' '}
            <a href={playUrl} target="_blank" rel="noreferrer">full Android app</a> has all five modes and
            difficulty levels, plus notes, hints, achievements, and a daily puzzle.
          </p>
        </div>

        <div className={`ndGame${finished ? ' finished' : ''}`}>
          <div className="ndTop">
            <div>
              <span className="ndLevel">Medium</span>
              <span className="ndMode">Classic</span>
            </div>
            <div className="ndStats">
              <div>
                <span className="ndStatLabel">Mistakes</span>
                <span ref={counterRef} className={`ndStatValue${mistakes ? ' bad' : ''}`}>
                  {mistakes}/{MISTAKE_LIMIT}
                </span>
              </div>
              <div>
                <span className="ndStatLabel">Time</span>
                <span className="ndStatValue" role="timer">{formatTime(elapsed)}</span>
              </div>
            </div>
          </div>

          <div className="ndBoardWrap">
            <div ref={boardRef} className={`ndBoard${lost ? ' lost' : ''}`} role="grid" aria-label="Sudoku board">
              {LINES.map((r) => (
                <div key={r} role="row" className="ndRow">
                  {LINES.map((c) => {
                    const i = r * 9 + c
                    return (
                      <button
                        key={i}
                        ref={(el) => {
                          cellRefs.current[i] = el
                        }}
                        type="button"
                        role="gridcell"
                        tabIndex={i === (selected ?? 0) ? 0 : -1}
                        aria-selected={i === selected}
                        aria-label={cellLabel(i)}
                        className={cellClass(i)}
                        onFocus={() => selectCell(i)}
                        onClick={() => {
                          selectCell(i)
                          cellRefs.current[i]?.focus()
                        }}
                      >
                        {board[i] || ''}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="ndControls">
            <div className="ndActions">
              <button type="button" className="ndAction" onClick={() => enter(0)} disabled={!canErase}>
                <span className="ndActionIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" />
                  </svg>
                </span>
                Erase
              </button>
              <button type="button" className="ndAction" onClick={newPuzzle}>
                <span className="ndActionIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                </span>
                New puzzle
              </button>
            </div>

            <div className="ndPad">
              {DIGITS.map((d) => {
                const left = remaining[d]
                return (
                  <button
                    key={d}
                    type="button"
                    className={`ndKey${left === 0 ? ' sated' : ''}${d === selectedValue ? ' active' : ''}`}
                    disabled={left === 0 || finished}
                    onClick={() => enter(d)}
                    aria-label={left === 0 ? `${d}, all placed` : `${d}, ${left} left`}
                  >
                    <span className="ndKeyDigit">{d}</span>
                    <span className="ndKeyCount" aria-hidden="true">
                      {left === 0 ? '✓' : left}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="ndStatus" aria-live="polite">
              {status}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
