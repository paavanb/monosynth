import React from 'react'
import { useCallback } from 'react'

import cs from './styles.module.css'

interface HarmonicsControllerProps {
  subOscEnabled: boolean
  onSubOscEnabledChange: (v: boolean) => void
  subSubOscEnabled: boolean
  onSubSubOscEnabledChange: (v: boolean) => void
}

export default function HarmonicsController(
  props: HarmonicsControllerProps
): JSX.Element {
  const {
    subOscEnabled,
    subSubOscEnabled,
    onSubOscEnabledChange,
    onSubSubOscEnabledChange,
  } = props

  const handleSubOscChange = useCallback(() => {
    onSubOscEnabledChange(!subOscEnabled)
  }, [subOscEnabled, onSubOscEnabledChange])

  const handleSubSubOscChange = useCallback(
    (evt) => {
      onSubSubOscEnabledChange(!subSubOscEnabled)
    },
    [subSubOscEnabled, onSubSubOscEnabledChange]
  )

  return (
    <form style={{ textAlign: 'center', width: 300 }}>
      <div className={cs.inlineControl}>
        <label>
          1x
          <input
            type="checkbox"
            name="sub-osc"
            checked={subOscEnabled}
            onChange={handleSubOscChange}
          />
        </label>
        <label>
          2x
          <input
            type="checkbox"
            name="sub-sub-osc"
            checked={subSubOscEnabled}
            onChange={handleSubSubOscChange}
          />
        </label>
      </div>
    </form>
  )
}
