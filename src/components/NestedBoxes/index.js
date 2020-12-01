import React, {Component} from 'react'
import './styles.css'
import _ from 'lodash'

const BUFFER_RATIO = .2
const TEXT_BUFFER_RATIO = .2
const DEFAULT_RATIO = .7
const FONT_SIZE_RATIO = .16
const HEADER_FONT_SIZE_RATIO = .22
const LINE_HEIGHT = 1.1

const NestedBoxes = ({
  ratios, colors, content, firstSide=100, horizontal=false, classes='',
  bufferRatio=BUFFER_RATIO, textBufferRatio=TEXT_BUFFER_RATIO, defaultRatio=DEFAULT_RATIO,
  fontSizeRatio=FONT_SIZE_RATIO, headerFontSizeRatio=HEADER_FONT_SIZE_RATIO, lineHeight=LINE_HEIGHT,
}) => {
  const resolveOrientation = (v1, v2) => {
      return horizontal ? v2 : v1
  }
  
  const bufferDistance = firstSide * (1 + bufferRatio)
  const textBufferDistance = firstSide * (1 + textBufferRatio)

  let side = firstSide
  let x = 0
  let y = 0

  const fontSize = firstSide * fontSizeRatio
  const headerFontSize = firstSide * headerFontSizeRatio

  const rects = []
  const texts = []
  const connectingLines = []

  _.each(ratios, (ratio, i) => {
    // const noRatio = !ratio
    ratio = ratio || defaultRatio

    const colorOuter = colors[i]
    const colorInner = colors[i+1]

    // add outer box
    rects.push(
      <rect
        key={'rect-o-' + i}
        x={resolveOrientation(x, y)}
        y={resolveOrientation(y, x)}
        width={side}
        height={side}
        fill={colorOuter}
      />
    )

    const { inner, below = [] } = _.get(content, i, {})
    const text = (
      <text
        key={'text-' + i}
        fontSize={fontSize}
        // set the initial y for all tspans
        // the x we set on each individually so they don't try to go one after another
        y={resolveOrientation(y + fontSize, textBufferDistance + fontSize)}
      >
        <tspan
          className='percent'
          x={resolveOrientation(textBufferDistance, y)}
          style={{ fill: colorInner, fontSize: headerFontSize }}
        >
          {inner || 'Unknown '}%
        </tspan>
        {below.map((txt) => (
          <tspan
            key={txt}
            className='description'
            x={resolveOrientation(textBufferDistance, y)}
            dy={fontSize * lineHeight}
          >
            {txt}
          </tspan>
        ))}
      </text>
    )
    texts.push(text)
    
    let nextSide = side * ratio
    const borderWidth = (side - nextSide)/2 // the amount of outer box that shows around the inner box
    x += borderWidth
    y += borderWidth
    side = nextSide
    
    // add inner box
    rects.push(
      <rect
        key={'rect-i-' + i}
        x={resolveOrientation(x, y)}
        y={resolveOrientation(y, x)}
        width={side}
        height={side}
        fill={colorInner}
      />
    )

    if (i === ratios.length-1) {
      return
    }
    
    // if there's another box coming, add lines to it
    const line1 = (
      <line
        key={'line-1-' + i}
        stroke={colorInner}
        x1={resolveOrientation(x, y+side)}
        x2={resolveOrientation(x, y+bufferDistance)}

        y1={resolveOrientation(y+side, x)}
        y2={resolveOrientation(y+bufferDistance, x)}
      />
    )
    const line2 = (
      <line
        key={'line-2-' + i}
        stroke={colorInner}
        x1={resolveOrientation(x+side, y+side)}
        x2={resolveOrientation(x+side, y+bufferDistance)}

        y1={resolveOrientation(y+side, x+side)}
        y2={resolveOrientation(y+bufferDistance, x+side)}
      />
    )
    connectingLines.push(line1, line2)
    
    // and shift down for the next
    y += bufferDistance
  })

  const totalX = firstSide + (textBufferDistance + firstSide) // (text width)
  const totalY = y + firstSide
  const totalXh = y + bufferDistance
  const totalYh = textBufferDistance + (headerFontSize + fontSize*4) // (text height)
  
  const classNames = 'nested-boxes ' + classes
  
  return (
    <div className={classNames}>
      {/* <p className='title'>{title}</p> */}
      <svg viewBox={`0 0 ${resolveOrientation(totalX, totalXh)} ${resolveOrientation(totalY, totalYh)}`}>
        {rects}
        {texts}
        {connectingLines}
      </svg>
    </div>
  )
}

export default NestedBoxes