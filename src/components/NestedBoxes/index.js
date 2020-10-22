import React, {Component} from 'react'
import './styles.css'
import _ from 'lodash'

const BUFFER_RATIO = .2
const DEFAULT_RATIO = .7
const FONT_SIZE_RATIO = .2
const HEADER_FONT_SIZE_RATIO = .3

class NestedBoxes extends Component {
  constructor(props) {
    super(props)
  }
  
  render() {
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
      rects.push(<rect x={x} y={y} width={side} height={side} fill={colorOuter} />)
      
      let nextSide = side * ratio
      const borderWidth = (side - nextSide)/2 // the amount of outer box that shows around the inner box
      x += borderWidth
      y += borderWidth
      side = nextSide
      
      // add inner box
      rects.push(<rect x={x} y={y} width={side} height={side} fill={colorInner} />)

      const { inner, below = [] } = _.get(this.props.content, i, {})

      const text = (
        <text fontSize={fontSize} x={0} y={y + fontSize}>
          <tspan className='percent' x={bufferDistance} style={{ fill: colorInner, fontSize: headerFontSize }}>
            {inner || 'Unknown '}%
          </tspan>
          {below.map(txt => <tspan className='description' x={bufferDistance} dy={fontSize}>{txt}</tspan>)}
        </text>
      )
      texts.push(text)

      if (i === this.props.ratios.length-1) {
        return
      }
      
      // if there's another box coming, add lines to it
      const line1 = <line stroke={colorInner} x1={x} x2={x} y1={y+side} y2={y+bufferDistance} />
      const line2 = <line stroke={colorInner} x1={x+side} x2={x+side} y1={y+side} y2={y+bufferDistance} />
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
        <svg viewBox={`0 0 ${totalX} ${totalY}`}>
          {rects}
          {texts}
          {connectingLines}
        </svg>
      </div>
    )
  }
}

export default NestedBoxes