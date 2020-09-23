import React, {Component} from 'react'
import './styles.css'
import Tooltip from '../Tooltip'

const women = { display: 'Women (15+)', id: 'women', group: 'women' }
const women15 = { display: 'Women (15-24)', id: 'women15', group: 'women' }
const women25 = { display: 'Women (25-34)', id: 'women25', group: 'women' }
const women35 = { display: 'Women (35-49)', id: 'women35', group: 'women' }
const women50 = { display: 'Women (50+)', id: 'women50', group: 'women' }
const men = { display: 'Men (15+)', id: 'men', group: 'men' }
const men15 = { display: 'Men (15-24)', id: 'men15', group: 'men' }
const men25 = { display: 'Men (25-34)', id: 'men25', group: 'men' }
const men35 = { display: 'Men (35-49)', id: 'men35', group: 'men' }
const men50 = { display: 'Men (50+)', id: 'men50', group: 'men' }

const allWomen = [women, women15, women25, women35, women50]
const allMen = [men, men15, men25, men35, men50]
const groups = [...allWomen, ...allMen]

class DemographicsTable extends Component {
  constructor(props) {
    super(props)
    
    console.log('MAD PROPS : ', props)
    
    this.state = { }
    this.getTable = this.getTable.bind(this)
    this.getHiddenRows = this.getHiddenRows.bind(this)
  }

  hideRow(gid) {
    this.setState({ [gid]: true })
  }
  unhideRow(gid) {
    this.setState({ [gid]: false })
  }

  toggleGroup(name) {
    const newState = {}
    if (name === 'hide-all') {
      groups.forEach(g => newState[g.id] = true)
    }
    if (name === 'show-all') {
      groups.forEach(g => newState[g.id] = false)
    }
    if (name === 'show-women') {
      allWomen.forEach(g => newState[g.id] = false)
      allMen.forEach(g => newState[g.id] = true)
    }
    if (name === 'show-men') {
      allMen.forEach(g => newState[g.id] = false)
      allWomen.forEach(g => newState[g.id] = true)
    }

    this.setState(newState)
  }

  getTable() {
    const relevantGroups = this.props.shiny ? groups : [women, women15, men, men15]
    const visibleGroups = relevantGroups.filter(g => !this.state[g.id])
    if (!visibleGroups.length) {
      return (
        <div className='empty-table text-center'>
          All rows are hidden. Select individual rows or a group below to display the table.
        </div>
      )
    }
    return (
      <table className='table table-striped table-hover table-responsive table-responsive-lg'>
        <thead>
          <tr>
            <th scope='col'></th>
            <th scope='col'>Estimated number of PLHIV</th>
            <th scope='col'>Undiagnosed PLHIV</th>
            <th scope='col'>PLHIV who know status (%)</th>
            <th scope='col'>HIV prevalence</th>
            <th scope='col'>New HIV infections</th>
            <th scope='col'>Tested in past year</th>
            <th scope='col'>Ever tested (%)</th>
          </tr>
        </thead>
        <tbody>
          {visibleGroups.map(g => (
            <tr key={g.id} onClick={this.hideRow.bind(this, g.id)}>
              <th scope='row'>{g.display}</th>
              <td>{g.display.startsWith('Women') ? '910 000' : '530 000'}</td>
              <td>{g.display.startsWith('Women') ? '54 600' : '63 600'}</td>
              <td>{g.display.startsWith('Women') ? '94%' : '88%'}</td>
              <td>{g.display.startsWith('Women') ? '6.1%' : '3.4%'}</td>
              <td>{g.display.startsWith('Women') ? '24 000' : '14 000'}</td>
              <td>{g.display.startsWith('Women') ? '7.4 million' : '3.9 million'}</td>
              <td>{g.display.startsWith('Women') ? '28%' : '19%'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  getHiddenRows() {
    const relevantGroups = this.props.shiny ? groups : [women, women15, men, men15]
    const hiddenGroups = relevantGroups.filter(g => this.state[g.id])
    if (!hiddenGroups.length) {
      // return null
      // return (
      //   <div className='hidden-rows'>
      //     <b>No rows hidden </b>
      //     <i>(click a row to hide)</i>
      //   </div>
      // )
    }

    const title = hiddenGroups.length ? 
      (
      <div className='title'>
        <b>Hidden rows:</b>
        <i>(click to unhide)</i>
      </div>
      ) : (
        <div className='title all-visible'>
          <b>No hidden rows</b>
          <i>(click a row to hide)</i>
        </div>
      )

    return(
      <div className='hidden-rows mt-3'>
        {title}
        <div className='rows'>
          {hiddenGroups.map(g => (
            <span
              key={g.id}
              onClick={this.unhideRow.bind(this, g.id)}
              className={`token hidden-row ${g.id}`}>
              {g.display}
            </span>
        ))}
        </div>
      </div>
    )
  }

  getGroupToggles() {
    return(
      <div className='group-toggles mt-3'>
        <span onClick={this.toggleGroup.bind(this, 'show-all')} className='token group show-all'>Show All</span>
        <span onClick={this.toggleGroup.bind(this, 'show-women')} className='token group show-women'>Only Women</span>
        <span onClick={this.toggleGroup.bind(this, 'show-men')} className='token group show-men'>Only Men</span>
        <span onClick={this.toggleGroup.bind(this, 'hide-all')} className='token group hide-all'>Hide All</span>
      </div>
    )
  }

  render() {
    let classes = 'demographics-table '
    if (this.props.classes) {
      classes += this.props.classes
    }
    return (
      <div className={classes}>
        <Tooltip className='table-tooltip'>
          <div>
            Data from multiple sources and time periods. Hover a data value for more information.
            Click a row to hide that row, or use filters below the table to tailor your view.
          </div>
        </Tooltip>
        <h2 className='table-title'>Population Groups </h2>
        {this.getTable()}
        <div className='row-control'>
          {this.getHiddenRows()}
          {this.getGroupToggles()}
        </div>
      </div>
    )
  }
}

export default DemographicsTable