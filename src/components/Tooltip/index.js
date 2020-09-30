import React, {Component} from 'react';


class Tooltip extends Component {
  constructor() {
    super()

    this.state = { open: false }
    this.openTooltip = this.openTooltip.bind(this)
    this.closeTooltip = this.closeTooltip.bind(this)
  }

  openTooltip() {
    this.setState(state => { 
      if (state.open) {
        return
      }
      document.addEventListener('click', this.closeTooltip)
      return { open: true }
    })
  }

  closeTooltip() {
    document.removeEventListener('click', this.closeTooltip)
    this.setState({ open: false })
  }
  
  render() {
    let classes = 'tooltip-container '
    if (this.state.open) {
      classes += 'open '
    }
    if (this.props.className) {
      classes += this.props.className
    }

    return (
      <div className={classes} onClick={this.openTooltip}>
        <svg
          viewBox='0 0 27 27'
          className='info-icon'
        >
          <circle cx="13.5" cy="13.5" r="13.5" fill="#DBEDF2"/>
          <circle cx="13.5" cy="7.5" r="1.5" fill="#709FAC"/>
          <rect x="12" y="11" width="3" height="10" rx="1.5" fill="#709FAC"/>
        </svg>
        <div className='contents'>
          {this.state.open && this.props.children}
        </div>
      </div>
    )
  }
}

export default Tooltip;
