'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Puzzle = { givens: string; solution: string }

const PUZZLES: Puzzle[] = [
  { givens: '083007060910002740207100000190000030652800070004000500001046007840700300729000006',
    solution: '483957261915362748267184953198475632652893174374621589531246897846719325729538416' },
  { givens: '940168000750230069200000000010700006307490500824356000000800100090010000070009602',
    solution: '943168257751234869286975413519782346367491528824356971635827194492613785178549632' },
  { givens: '700205916008006700100030000806050201005007000204018500000940002092000157000002609',
    solution: '743285916528196734169734825836459271915327468274618593657941382492863157381572649' },
  { givens: '090800500640172039700090000020000080800009643500704002100000070970201304250000100',
    solution: '391846527645172839782395461429613785817529643563784912134958276978261354256437198' },
  { givens: '067003900302040010050709064905080020600000005000306100006008003500104800000567091',
    solution: '467813952392645718158729364935481627681972435274356189716298543529134876843567291' },
  { givens: '005240063008396400040807000050010237000430080600970041002003090400009050000000308',
    solution: '795241863128396475346857129954618237271435986683972541812563794437189652569724318' },
]

function parseRow(s: string): number[] {
  return s.split('').map((c) => parseInt(c, 10))
}

export default function NinerDemo() {
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0)
  const [seeded, setSeeded] = useState<boolean>(false)
  const puzzle = PUZZLES[puzzleIdx]
  const givens = useMemo(() => parseRow(puzzle.givens), [puzzle])
  const solution = useMemo(() => parseRow(puzzle.solution), [puzzle])
  const [board, setBoard] = useState<number[]>(() => parseRow(PUZZLES[0].givens))
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Pick a random starting puzzle after mount (avoids server/client hydration mismatch)
  useEffect(() => {
    if (seeded) return
    const idx = Math.floor(Math.random() * PUZZLES.length)
    setPuzzleIdx(idx)
    setBoard(parseRow(PUZZLES[idx].givens))
    setSeeded(true)
  }, [seeded])

  // Reset board when puzzle index changes
  useEffect(() => {
    setBoard(parseRow(PUZZLES[puzzleIdx].givens))
    setSelected(null)
    setWrong(null)
  }, [puzzleIdx])

  const complete = useMemo(
    () => board.every((v, i) => v === solution[i]),
    [board, solution]
  )

  const enter = useCallback(
    (digit: number) => {
      if (selected == null) return
      if (givens[selected] !== 0) return
      if (digit === 0) {
        setBoard((b) => {
          const nb = [...b]
          nb[selected] = 0
          return nb
        })
        return
      }
      if (digit === solution[selected]) {
        setBoard((b) => {
          const nb = [...b]
          nb[selected] = digit
          return nb
        })
      } else {
        // Wrong: show briefly, then clear
        const idx = selected
        setBoard((b) => {
          const nb = [...b]
          nb[idx] = digit
          return nb
        })
        setWrong(idx)
        window.setTimeout(() => {
          setBoard((b) => {
            const nb = [...b]
            if (nb[idx] === digit && solution[idx] !== digit) nb[idx] = 0
            return nb
          })
          setWrong((w) => (w === idx ? null : w))
        }, 400)
      }
    },
    [selected, givens, solution]
  )

  const move = useCallback((dr: number, dc: number) => {
    setSelected((cur) => {
      const c = cur ?? 40
      const r = Math.floor(c / 9)
      const col = c % 9
      const nr = Math.max(0, Math.min(8, r + dr))
      const nc = Math.max(0, Math.min(8, col + dc))
      return nr * 9 + nc
    })
  }, [])

  // Keys are handled by the root div so they only fire when the demo has focus
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '9') {
      enter(parseInt(e.key, 10))
      e.preventDefault()
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      enter(0)
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      move(-1, 0)
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      move(1, 0)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      move(0, -1)
      e.preventDefault()
    } else if (e.key === 'ArrowRight') {
      move(0, 1)
      e.preventDefault()
    }
  }

  const selectCell = (i: number) => {
    setSelected(i)
    rootRef.current?.focus()
  }

  const newPuzzle = () => {
    setPuzzleIdx((i) => (i + 1) % PUZZLES.length)
  }

  const cellClass = (i: number): string => {
    const classes: string[] = ['ninerCell']
    if (givens[i] !== 0) classes.push('given')
    if (i === selected) classes.push('selected')
    if (selected != null) {
      const sr = Math.floor(selected / 9)
      const sc = selected % 9
      const r = Math.floor(i / 9)
      const c = i % 9
      const sameBox =
        Math.floor(sr / 3) === Math.floor(r / 3) &&
        Math.floor(sc / 3) === Math.floor(c / 3)
      if (i !== selected && (r === sr || c === sc || sameBox)) classes.push('peer')
      if (
        board[selected] !== 0 &&
        board[i] === board[selected] &&
        i !== selected
      )
        classes.push('sameDigit')
    }
    if (i === wrong) classes.push('wrong')
    return classes.join(' ')
  }

  const remaining = (digit: number): number =>
    9 - board.filter((v) => v === digit).length

  return (
    <section className="ninerDemo wrap" aria-label="Playable Niner demo">
      <div
        ref={rootRef}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="ninerDemoCard"
      >
        <div className="ninerDemoHeader">
          <div>
            <div className="sectionLabel">Try it</div>
            <h2 className="ninerDemoTitle">Play a web port of Niner</h2>
            <p className="ninerDemoLede">
              A stripped-down web version of the core game. The full Android app has
              five modes, five difficulties, achievements, and offline daily puzzles.
              Click a cell and type <span className="ninerKbd">1</span>–<span className="ninerKbd">9</span>, or use the pad.
            </p>
          </div>
          <button className="btn secondary ninerNewBtn" onClick={newPuzzle}>
            New puzzle
          </button>
        </div>

        <div className="ninerDemoBody">
          <div className="ninerBoardWrap">
            <svg
              viewBox="0 0 450 450"
              className="ninerBoard"
              role="grid"
              aria-label="Sudoku board"
            >
              {Array.from({ length: 81 }, (_, i) => {
                const r = Math.floor(i / 9)
                const c = i % 9
                return (
                  <rect
                    key={`bg-${i}`}
                    x={c * 50}
                    y={r * 50}
                    width={50}
                    height={50}
                    className={cellClass(i)}
                    onClick={() => selectCell(i)}
                  />
                )
              })}
              {Array.from({ length: 10 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  x2={450}
                  y1={i * 50}
                  y2={i * 50}
                  className={i % 3 === 0 ? 'ninerLineThick' : 'ninerLineThin'}
                />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  y1={0}
                  y2={450}
                  x1={i * 50}
                  x2={i * 50}
                  className={i % 3 === 0 ? 'ninerLineThick' : 'ninerLineThin'}
                />
              ))}
              {board.map((v, i) =>
                v === 0 ? null : (
                  <text
                    key={`t-${i}`}
                    x={(i % 9) * 50 + 25}
                    y={Math.floor(i / 9) * 50 + 34}
                    textAnchor="middle"
                    className={`ninerValue ${givens[i] === 0 ? 'entered' : 'given'} ${
                      i === wrong ? 'wrong' : ''
                    }`}
                  >
                    {v}
                  </text>
                )
              )}
            </svg>
          </div>

          <div className="ninerPad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
              const left = remaining(d)
              return (
                <button
                  key={d}
                  type="button"
                  className="ninerPadKey"
                  disabled={left === 0}
                  onClick={() => enter(d)}
                  aria-label={`Enter ${d}`}
                >
                  <span className="ninerPadDigit">{d}</span>
                  <span className="ninerPadLeft">{left}</span>
                </button>
              )
            })}
            <button
              type="button"
              className="ninerPadKey ninerPadClear"
              onClick={() => enter(0)}
              aria-label="Clear selected cell"
            >
              ×
            </button>
          </div>
        </div>

        <p className="ninerDemoStatus" aria-live="polite">
          {complete
            ? '✓ Solved. Hit "New puzzle" for another.'
            : selected == null
            ? 'Click any cell to begin.'
            : 'Wrong entries flash red and clear — the board always reflects what you know.'}
        </p>
      </div>
    </section>
  )
}
