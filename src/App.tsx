import React from 'react'
import { useState } from 'react'

import MonoSynth from './MonoSynth'
import './App.css'

function App(): JSX.Element {
  const [started, setStarted] = useState(false)

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
