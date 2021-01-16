import React from 'react'
import { useState } from 'react'
import * as Tone from 'tone'

import MonoSynth from './MonoSynth'
import './App.css'

function App(): JSX.Element {
  const [started, setStarted] = useState(false)

  return (
    <div className="App">
      <main className="container">
        {!started ? (
          <div>
            <button
              className="start-btn"
              onClick={() => {
                setStarted(true)
                Tone.start()
              }}
            >
              Start Synth
            </button>
            <h5>Warning: only Chrome is supported</h5>
          </div>
        ) : (
          <MonoSynth />
        )}
      </main>
    </div>
  )
}

export default App
