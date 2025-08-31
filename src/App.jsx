import React, { useEffect, useMemo, useState } from 'react'
import Confetti from './Confetti.jsx'
import { loadState, saveState } from './storage.js'

const MIN_DISKS = 3
const MAX_DISKS = 7

function makeInitialPiles(n) {
  return [Array.from({ length: n }, (_, i) => n - i), [], []]
}

export default function App() {
  const [diskCount, setDiskCount] = useState(MIN_DISKS)
  const [piles, setPiles] = useState(makeInitialPiles(MIN_DISKS))
  const [selectedPeg, setSelectedPeg] = useState(null)
  const [moves, setMoves] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [history, setHistory] = useState([]) // single-step undo stack
  const [hint, setHint] = useState(null) // { from, to } | null

  // Load from localStorage once on mount
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setDiskCount(Math.min(Math.max(saved.diskCount, MIN_DISKS), MAX_DISKS))
      setPiles(saved.piles)
      setMoves(saved.moves)
      setCompleted(saved.completed)
      setHistory(Array.isArray(saved.history) ? saved.history : [])
    }
  }, [])

  // Persist on changes
  useEffect(() => {
    saveState({ diskCount, piles, moves, completed, history })
  }, [diskCount, piles, moves, completed, history])

  const minMoves = useMemo(() => (1 << diskCount) - 1, [diskCount])

  useEffect(() => {
    if (completed) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 2800)
      return () => clearTimeout(t)
    }
  }, [completed])

  // Auto-clear hint after a short time
  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => setHint(null), 5000)
    return () => clearTimeout(t)
  }, [hint])

  function handlePegClick(idx) {
    if (completed) return
    if (selectedPeg === null) {
      // select if has disks
      if (piles[idx].length > 0) setSelectedPeg(idx)
      return
    }
    if (selectedPeg === idx) {
      // deselect when clicking same
      setSelectedPeg(null)
      return
    }

    const from = selectedPeg
    const to = idx
    const newPiles = piles.map((p) => [...p])
    const moving = newPiles[from][newPiles[from].length - 1]
    if (moving == null) {
      setSelectedPeg(null)
      return
    }
    const targetTop = newPiles[to][newPiles[to].length - 1]
    if (targetTop == null || moving < targetTop) {
      newPiles[from].pop()
      newPiles[to].push(moving)
      setPiles(newPiles)
      setMoves((m) => m + 1)
      setHistory((h) => [...h, { from, to, disk: moving }])
      setSelectedPeg(null)
      setHint(null)
      // Win condition: all disks on last peg
      if (newPiles[2].length === diskCount) {
        setCompleted(true)
      }
    } else {
      // illegal move -> switch selection to target if it has disks, else keep original
      if (newPiles[to].length > 0) setSelectedPeg(to)
      else setSelectedPeg(from)
    }
  }

  function newGame(n) {
    setDiskCount(n)
    setPiles(makeInitialPiles(n))
    setMoves(0)
    setSelectedPeg(null)
    setCompleted(false)
    setHistory([])
  }

  function nextLevel() {
    const next = Math.min(diskCount + 1, MAX_DISKS)
    newGame(next)
  }

  function retryLevel() {
    newGame(diskCount)
  }

  function resetProgress() {
    newGame(MIN_DISKS)
  }

  function undoMove() {
    if (history.length === 0) return
    const last = history[history.length - 1]
    const newPiles = piles.map((p) => [...p])
    // Pop from 'to' only if it matches the recorded disk to keep state safe
    const top = newPiles[last.to][newPiles[last.to].length - 1]
    if (top !== last.disk) {
      // State mismatch; abort undo to avoid corruption
      return
    }
    newPiles[last.to].pop()
    newPiles[last.from].push(last.disk)
    setPiles(newPiles)
    setMoves((m) => Math.max(0, m - 1))
    setCompleted(false)
    setSelectedPeg(null)
    setHistory((h) => h.slice(0, -1))
  }

  function requestHint() {
    if (completed) return
    // Prefer moving the smallest available top disk towards the rightmost legal peg
    const tops = piles.map((p) => (p.length ? p[p.length - 1] : null))
    let best = null
    let fromIdx = -1
    let smallest = Infinity
    for (let i = 0; i < 3; i++) {
      if (tops[i] != null && tops[i] < smallest) {
        smallest = tops[i]
        fromIdx = i
      }
    }
    if (fromIdx !== -1) {
      const order = [2, 1, 0]
      for (const j of order) {
        if (j === fromIdx) continue
        const topTo = tops[j]
        if (topTo == null || smallest < topTo) {
          best = { from: fromIdx, to: j }
          break
        }
      }
    }
    // Fallback: any legal move
    if (!best) {
      outer: for (let i = 0; i < 3; i++) {
        if (tops[i] == null) continue
        for (let j = 0; j < 3; j++) {
          if (i === j) continue
          const topTo = tops[j]
          if (topTo == null || tops[i] < topTo) {
            best = { from: i, to: j }
            break outer
          }
        }
      }
    }
    if (best) {
      setSelectedPeg(null)
      setHint(best)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Tower of Hanoi</h1>
        <p className="subtitle">Click a tower, then another to move the top disk.</p>
      </header>

      <section className="panel">
        <div className="stats">
          <span><strong>Level:</strong> {diskCount} disks</span>
          <span><strong>Moves:</strong> {moves}</span>
          <span><strong>Best possible:</strong> {minMoves}</span>
        </div>
        <div className="actions">
          <button className="btn" onClick={requestHint} disabled={completed} title="Show a helpful move">Hint</button>
          <button className="btn" onClick={undoMove} disabled={history.length === 0} title="Undo last move">Undo</button>
          <button className="btn" onClick={retryLevel}>Restart Level</button>
          <button className="btn" onClick={resetProgress}>Reset Progress</button>
        </div>
      </section>

      <GameBoard
        piles={piles}
        selectedPeg={selectedPeg}
        onPegClick={handlePegClick}
        diskCount={diskCount}
        hint={hint}
      />

      {completed && (
        <div className="overlay">
          {showConfetti && <Confetti />}
          <div className="modal">
            <h2>Great job!</h2>
            <p>You solved it in {moves} moves.</p>
            <div className="modal-actions">
              {diskCount < MAX_DISKS ? (
                <button className="btn primary" onClick={nextLevel}>Next Level ({diskCount + 1} disks)</button>
              ) : (
                <button className="btn primary" onClick={retryLevel}>Play Again</button>
              )}
              <button className="btn" onClick={() => setCompleted(false)}>Keep Looking</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <small>For ages 7–12 • Be patient and think ahead!</small>
      </footer>
    </div>
  )
}

function GameBoard({ piles, selectedPeg, onPegClick, diskCount, hint }) {
  return (
    <div className="board">
      {piles.map((pile, idx) => (
        <Peg
          key={idx}
          index={idx}
          disks={pile}
          selected={selectedPeg === idx}
          hintFrom={hint && hint.from === idx}
          hintTo={hint && hint.to === idx}
          onClick={() => onPegClick(idx)}
          diskCount={diskCount}
        />
      ))}
    </div>
  )
}

function Peg({ index, disks, selected, hintFrom, hintTo, onClick, diskCount }) {
  return (
    <button className={`peg ${selected ? 'selected' : ''} ${hintFrom ? 'hint-from' : ''} ${hintTo ? 'hint-to' : ''}`} onClick={onClick} aria-label={`Peg ${index + 1}`}>
      <div className="rod" />
      <div className="stack">
        {[...disks].reverse().map((size, i) => (
          <Disk key={i} size={size} max={diskCount} />
        ))}
      </div>
      <div className="base" />
    </button>
  )
}

function Disk({ size, max }) {
  const widthPercent = 20 + (size / max) * 70 // between 20% and 90%
  const hue = 30 + (size / max) * 280 // colorful range
  return (
    <div
      className="disk"
      style={{
        width: widthPercent + '%',
        background: `linear-gradient(135deg, hsl(${hue}, 85%, 65%), hsl(${hue}, 85%, 55%))`,
        boxShadow: `0 6px 0 rgba(0,0,0,0.15)`
      }}
    />
  )
}
