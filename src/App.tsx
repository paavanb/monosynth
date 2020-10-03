import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'

import MonoSynth from './MonoSynth'
import './App.css'

function App(): JSX.Element {
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (started) Tone.start()
  }, [started])

  return (
    <div className="App">
      <main className="container">
        {!started ? (
          <button onClick={() => setStarted(true)}>Start Synth</button>
        ) : (
          <MonoSynth />
        )}
      </main>
    </div>
  )
}

export default App
