import React from 'react'
import {useState, useMemo} from 'react'
import * as Tone from 'tone'

import logo from './logo.svg'
import './App.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

function App() {
  const [started, setStarted] = useState(false)
  const synth = useMemo(() => {
    const monosynth = new Tone.Synth().toDestination()
    return monosynth
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        {!started ? (
          <button onClick={() => setStarted(true)}>Start Synth</button>
        ) : (
          <button
            onMouseDown={() => {
              const now = Tone.now()
              synth.triggerAttack("C4", now)
            }}
            onMouseUp={() => {
              const now = Tone.now()
              synth.triggerRelease(now)
            }}>Play Note</button>
        )}
      </header>
    </div>
  )
}

export default App;
