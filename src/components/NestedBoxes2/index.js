import React, {Component} from 'react'
import './styles.css'

const EXPANDER = 1.1

class NestedBoxes extends Component {
  constructor(props) {
    super(props)
    
    this.getBoxes = this.getBoxes.bind(this)
    this.getInards = this.getInards.bind(this)
    this.getBelow = this.getBelow.bind(this)
    this.accumulatedBorderWidth = 0
  }
  
  getBoxes(side, idx) {
    if (idx === 0) {
      this.accumulatedBorderWidth = 0
    }
    
    const { ratios } = this.props
    let ratio = ratios[idx]
    const noRatio = !ratio
    ratio = ratio || .8 // todo: default
    const nextSide = (ratio*side) //for border px
    const borderWidth = (side - nextSide)/2
    
    const height = idx === 0 ? side : '100%'
		const color = this.props.colors[idx] || 'black'
    const boxStyle = {
      height,
      width: side - (1.8*idx), // pixfix
      background: this.props.colors[idx+1],
      border: `solid ${borderWidth}px ${color}`,
      borderRadius: this.props.circle ? '50%' : 0
    }

    // must call this before getBoxes for nextBoxes for accumulatedBorder hack to work
    const below = this.getBelow(idx, borderWidth)
    
    let nextBoxes;
		 if (idx < this.props.ratios.length - 1) {
     	let borderColor = 'transparent'
      if (
      	!this.props.circle &&
        !this.props.bridgeless &&
        this.props.colors[idx+1]
       ) {
       	borderColor = this.props.colors[idx+1]
       }
      const bridgeStyle = {
        width: (side * EXPANDER) + this.props.side-borderWidth,
        // width: (side + nextSide - borderWidth) + (nextSide/8) - (3.6*idx), // pixfix
        borderColor: borderColor
      }
    	nextBoxes = (
      	<div 
          className={'bridge bridge-'+idx}
          style={bridgeStyle}
        >
          {this.getBoxes(nextSide, idx+1)}
        </div>
      )
    }

    return (
    	<div
        style={boxStyle}
        className={'box box-'+idx}
      >
       {nextBoxes}
       {this.getInards(idx, nextSide)}
       {below}
      </div>
    )
  }
  
  getInards(idx, innerSide) {
  	if (
    	!this.props.content ||
      !this.props.content[idx] ||
      !this.props.content[idx].inner
     ) return
    const content = this.props.content[idx].inner
    return null
  	return (
    	<div
        className={'inner-content inner-content-'+idx}
        style={{fontSize: innerSide/3}}
       >
        <div>{content}</div>
      </div>
    )
  }  
  
  getBelow(idx, borderWidth) {
  	if (
    	!this.props.content ||
      !this.props.content[idx] ||
      !this.props.content[idx].below
     ) return
    const content = this.props.content[idx].below
    const heading = this.props.content[idx].inner || 'Unknown '

    // TODO: eliminate hack
    this.accumulatedBorderWidth += borderWidth

  	return (
    	<div
        className={'below-content below-content-'+idx}
        style={{
          // transform: `translate(0, ${borderWidth+5}px)`,
          top: `calc(100% + ${this.accumulatedBorderWidth + 5}px)`,
          left: -borderWidth,
          width: this.props.side
          // right: -(this.props.side),
          // right: -borderWidth,
        }}
       >
        <span className='heading' style={{ color: this.props.colors[idx + 1] }}>{heading}%</span>
        {/* <div>{content.map(text => <div key={text}>{text}</div>)}</div> */}
        <div>{content}</div>
      </div>
    )
  }
  
  render() {
    const boxes = this.getBoxes(this.props.side, 0)

    let width = this.props.side * (this.props.ratios.length) * EXPANDER
    // let sideLength = this.props.side
    // this.props.ratios.forEach((r,i) => {
    //   if (i === this.props.ratios.length-1) {
    //     return
    //   }

    //   sideLength *= r
    //   width += 9/8 * sideLength // include bridge width
    // })
    
    const style = {
      width: width + 'px',
      minHeight: this.props.side+160+'px',
      // height: (this.props.side * 2) + 'px',
    }
    
    return (
      <div className='nested-boxes' style={style}>
        <p className='title'>{this.props.title}</p>
        {boxes}
      </div>
    )
  }
}

export default NestedBoxes