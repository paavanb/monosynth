import React from 'react'
import {useState, useMemo} from 'react'
import * as Tone from 'tone'

import MonoSynth from './MonoSynth'
import './App.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

function App() {
  const [started, setStarted] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        {!started ? (
          <button onClick={() => setStarted(true)}>Start Synth</button>
        ) : (
          <MonoSynth />
        )}
      </header>
    </div>
  )
}

export default App;
