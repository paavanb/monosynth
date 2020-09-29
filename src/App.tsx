import React from 'react'
import {useState, useMemo} from 'react'
import * as Tone from 'tone'

import logo from './logo.svg'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const synth = useMemo(() => new Tone.Synth().toDestination(), [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
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
