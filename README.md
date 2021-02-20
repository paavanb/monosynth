# Monosynth

Inspired by the [Stylophone GEN X-1](https://dubreq.com/product/stylophone-gen-x-1/), this project creates a webapp
that allows you to play with a digital monosynth, powered by [Tone.js](https://tonejs.github.io/).

## [Try it out here!](https://paavanb.github.io/monosynth)
Due to nuances in the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API),
only the Chrome browser is supported at the moment.

## Keyboard
The synth can be played by clicking/dragging on the ribbon keyboard at the bottom of the screen, or by using your own
computer keyboard (QWERTY). Spacebar is middle C, the top row of letters are the white keys, and (most) numbers
are the black keys. Use the bottom row of letters to shift up and down octaves. Play around!

## Design Experiments

There are a couple places where I've opted for designs that are deliberately different from other web synths.

### Logarithmic Sliders

One of the most frustrating patterns I've seen is the usage of linearly-scaled skeumorphic knobs.
Knobs are difficult to interact with on a computer, making simple sliders a better option, and the linear
scale is at odds with the fact that we experience sound logarithmically: the difference between 100 Hz and 200 Hz is
an entire octave, but the difference betwen 1,000 Hz and 1,100 Hz is a bit more than 1 semitone. Using a linear
scale for Hz means that it's very difficult to get semitone-level precision at lower values, since a small adjustment
results in a massive change in tone.

This is why the Monosynth opts for logarithmically scaled sliders for almost all settings, allowing you to be precise
at both low and high values.

### Two-dimensional LFO

The web synths that I've seen let you adjust the LFO (Low-Frequency Oscillator) using two sliders, controlling the
frequency and the pitch. It's hard to visualize how these two numbers affect the sound, so I decided to combine
the two sliders into a single 2D "pad". I believe it's a more effective visualization, and has the huge advantage of
letting you adjust both values at the same time.

### Envelopes

The Gen X-1 and other synths split up an envelope's settings into four values: attack, decay, sustain, and release.
I found these difficult to play with, since changing attack or decay would change the overall onset time of the tone.
If you wanted to keep the onset time relatively constant, you have to carefully adjust attack and decay in opposite
directions (e.g., increasing attack would require a decrease in decay).

For the Monosynth, I decided to break down an envelope's settings differently:

* Onset - The time it takes for the tone to settle into the "sustain" value
* Attack-Decay Split - The ratio between attack and decay within the onset time. For example, a high value means
long attack, short decay.
* Sustain - The sustain value as usual
* Release - The release time as usual


I've found that this breakdown makes it a lot more fun to play with different kinds of sounds. I can set the onset time
of the tone and then fiddle with the attack-decay split to get wildly different sounds, but without changing the onset
quality. The graph above each envelope's settings is important since it gives you a quick visual of how your play is
affecting the shape of the tone. Try changing the curve types to see how they change the envelope!

### Keyboard

It's difficult to map a musical keyboard onto a computer's keyboard, but the web synths I've played with tend to have
mappings that make it incredibly difficult to play. For the Monosynth, I've opted for a system that lets your hands
rest relatively comfortably while playing on a QWERTY keyboard.

The biggest decision is to make Middle C (C4) played with the spacebar. The white keys are then played with the top
row of letters and the black keys are the numbers. I've found this to feel pretty natural while playing.

Since this only allows you to play down to (but not including) C3, and likewise up to C5, I've added keys for modifying
the note to play octaves higher or lower. `v`, `c`, `x`, and `z` shift down an octave, while `b`, `n`, `m`, `,`, and `.`
shift up an octave. Pressing multiple at a time let you stack octaves, which isn't the best experience and doesn't
work on all keyboards. In the future, the Monosynth will likely change to let these modifier keys shift `n` octaves
by themselves (e.g., making `x` shift down three octaves).


## Development

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`

Builds and deploys the app to the `gh-pages` branch, which can then be pushed to update the project site.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
