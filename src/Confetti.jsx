import React, { useEffect, useMemo } from 'react'

// Lightweight confetti using CSS; avoids external libs.
export default function Confetti({ count = 150, durationMs = 2500 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => i), [count])

  useEffect(() => {
    // Component exists only during confetti time
  }, [])

  return (
    <div className="confetti-container" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: Math.random() * 100 + '%',
            animationDelay: (Math.random() * 0.7).toFixed(2) + 's',
            animationDuration: (1.8 + Math.random() * 1.2).toFixed(2) + 's',
            backgroundColor: pickColor(i),
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  )
}

function pickColor(i) {
  const colors = ['#ff6b6b', '#ffd93d', '#6bcB77', '#4d96ff', '#9b5de5', '#ef476f']
  return colors[i % colors.length]
}

