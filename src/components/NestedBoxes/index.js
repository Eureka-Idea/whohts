import React, {Component} from 'react'
import './styles.css'
import _ from 'lodash'

const BUFFER_RATIO = .2
const DEFAULT_RATIO = .7
const FONT_SIZE_RATIO = .16
const HEADER_FONT_SIZE_RATIO = .22

class NestedBoxes extends Component {
  constructor(props) {
    super(props)
  }
  
  render() {
    const resolveOrientation = (v1, v2) => {
       return this.props.horizontal ? v2 : v1
    }
    
    const bufferDistance = this.props.side * (1 + BUFFER_RATIO)

    let side = this.props.side
    let x = 0
    let y = 0

    const fontSize = this.props.side * FONT_SIZE_RATIO
    const headerFontSize = this.props.side * HEADER_FONT_SIZE_RATIO

    const rects = []
    const texts = []
    const connectingLines = []

    _.each(this.props.ratios, (ratio, i) => {
      const noRatio = !ratio
      ratio = ratio || DEFAULT_RATIO

      const colorOuter = this.props.colors[i]
      const colorInner = this.props.colors[i+1]

      // add outer box
      rects.push(<rect x={resolveOrientation(x, y)} y={resolveOrientation(y, x)} width={side} height={side} fill={colorOuter} />)
      
      let nextSide = side * ratio
      const borderWidth = (side - nextSide)/2 // the amount of outer box that shows around the inner box
      x += borderWidth
      y += borderWidth
      side = nextSide
      
      // add inner box
      rects.push(
        <rect 
          x={resolveOrientation(x, y)}
          y={resolveOrientation(y, x)}
          width={side}
          height={side}
          fill={colorInner}
        />
      )

      const { inner, below = [] } = _.get(this.props.content, i, {})

      const text = (
        <text
          fontSize={fontSize}
          // set the initial y for all tspans
          // the x we set on each individually so they don't try to go one after another
          y={resolveOrientation(y+fontSize, bufferDistance)}
        >
          <tspan
            className='percent'
            x={resolveOrientation(bufferDistance, y)}
            style={{ fill: colorInner, fontSize: headerFontSize }}
          >
            {inner || 'Unknown '}%
          </tspan>
          {below.map((txt, i) => 
            <tspan
              className='description' 
              x={resolveOrientation(bufferDistance, y)}
              dy={fontSize*1.1}
            >{txt}</tspan>)}
        </text>
      )
      texts.push(text)

      if (i === this.props.ratios.length-1) {
        return
      }
      
      // if there's another box coming, add lines to it
      const line1 = (
        <line
          stroke={colorInner}
          x1={resolveOrientation(x, y+side)}
          x2={resolveOrientation(x, y+bufferDistance)}

          y1={resolveOrientation(y+side, x)}
          y2={resolveOrientation(y+bufferDistance, x)}
        />
      )
      const line2 = (
        <line
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

    const sideTextWidth = bufferDistance + this.props.side
    const totalY = y + this.props.side
    const totalX = sideTextWidth + this.props.side
    
    return (
      <div className='nested-boxes'>
        {/* <p className='title'>{this.props.title}</p> */}
        <svg viewBox={`0 0 ${resolveOrientation(totalX, totalY)} ${resolveOrientation(totalY, totalX)}`}>
          {rects}
          {texts}
          {connectingLines}
        </svg>
      </div>
    )
  }
}

export default NestedBoxes