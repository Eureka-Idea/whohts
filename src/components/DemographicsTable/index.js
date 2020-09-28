import React, {Component} from 'react'
import ReactTooltip from 'react-tooltip';
import _ from 'lodash'
import './styles.css'
import Tooltip from '../Tooltip'
import { AGE_MAP, SOURCE_DISPLAY_MAP } from '../../constants/charts'

const indicators = [
  { 
    id: 'plhiv',
    displayName: 'Estimated number of PLHIV',
  }, { 
    id: 'undiagnosed',
    displayName: 'Undiagnosed PLHIV',
  }, { 
    id: 'aware',
    displayName: 'PLHIV who know status (%)',
  }, { 
    id: 'prev',
    displayName: 'HIV prevalence (%)',
  }, { 
    id: 'newly',
    displayName: 'New HIV infections',
  }, { 
    id: 'year',
    displayName: 'Tested in past year',
  }, { 
    id: 'ever',
    displayName: 'Ever tested (%)'
  }
]

const demos = [
  {
    id: `f${AGE_MAP.ALL_ADULTS}`,
    display: 'Women (15+)',
    group: 'women'
  }, {
    id: `f${AGE_MAP.ADULTS15}`,
    display: 'Women (15-24)',
    group: 'women'
  }, {
    id: `f${AGE_MAP.ADULTS25}`,
    display: 'Women (25-34)',
    group: 'women'
  }, {
    id: `f${AGE_MAP.ADULTS35}`,
    display: 'Women (35-49)',
    group: 'women'
  }, {
    id: `f${AGE_MAP.ADULTS50}`,
    display: 'Women (50+)',
    group: 'women'
  }, {
    id: `m${AGE_MAP.ALL_ADULTS}`,
    display: 'Men (15+)',
    group: 'men'
  }, {
    id: `m${AGE_MAP.ADULTS15}`,
    display: 'Men (15-24)',
    group: 'men'
  }, {
    id: `m${AGE_MAP.ADULTS25}`,
    display: 'Men (25-34)',
    group: 'men'
  }, {
    id: `m${AGE_MAP.ADULTS35}`,
    display: 'Men (35-49)',
    group: 'men'
  }, {
    id: `m${AGE_MAP.ADULTS50}`,
    display: 'Men (50+)',
    group: 'men'
  }
]

const demoMap = _.mapKeys(demos, 'id')

// const allWomen = [women, women15, women25, women35, women50]
// const allMen = [men, men15, men25, men35, men50]
// const groups = [...allWomen, ...allMen]

class DemographicsTable extends Component {
  constructor(props) {
    super(props)
    
    console.log('MAD PROPS : ', props)
    this.allWomen = []
    this.allMen = []
    this.everyone = []
    props.config.includedDemographics.forEach(dem => {
      const demObj = _.get(demoMap, dem)
      if (!demObj) {
        console.error('no demographic found for: ', dem)
        return
      }
      this.everyone.push(demObj)
      if (demObj.group === 'men') {
        this.allMen.push(demObj)
      } else {
        this.allWomen.push(demObj)
      }
    })
    
    this.state = { }
    this.getTable = this.getTable.bind(this)
    this.getHiddenRows = this.getHiddenRows.bind(this)
  }

  hideRow(demId) {
    this.setState({ [demId]: true })
  }
  unhideRow(demId) {
    this.setState({ [demId]: false })
  }

  toggleGroup(name) {
    const newState = {}
    if (name === 'hide-all') {
      this.everyone.forEach(dem => newState[dem.id] = true)
    }
    if (name === 'show-all') {
      this.everyone.forEach(dem => newState[dem.id] = false)
    }
    if (name === 'show-women') {
      this.allWomen.forEach(dem => newState[dem.id] = false)
      this.allMen.forEach(dem => newState[dem.id] = true)
    }
    if (name === 'show-men') {
      this.allMen.forEach(dem => newState[dem.id] = false)
      this.allWomen.forEach(dem => newState[dem.id] = true)
    }

    this.setState(newState)
  }

  getTable() {
    const visibleGroups = this.everyone.filter(dem => !this.state[dem.id])
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
            {indicators.map(ind => (
              <th scope='col' key={ind.id}>{ind.displayName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleGroups.map(dem => (
            <tr key={dem.id} onClick={this.hideRow.bind(this, dem.id)}>
              <th scope='row'>{dem.display}</th>
              
              {indicators.map(({ id }) => {
                const data = _.get(this.props.config, ['dataMap', dem.id, id], {})
                const { value, valueUpper, valueLower, source, year, noData } = data

                const uid = `${dem.id}-${id}`
                // const x = (<p data-tip= "<p>HTML tooltip</p>" data-html={true}>aoeu</p>)
                const tooltipId = 'tooltip-'+uid
                let val
                if (!value || noData) {
                  val = <span>N/A</span>
                } else if (id === 'undiagnosed') {
                  val = <span>{value}</span>
                } else {
                 val = <a data-tip data-for={tooltipId}>{value} </a>
                }
                const tooltip = (
                  <ReactTooltip id={tooltipId} type='info' effect='solid'>
                    <div>Upper bound: {valueUpper}</div>
                    <div>Lower bound: {valueLower}</div>
                    <div>Source: {SOURCE_DISPLAY_MAP[source]||source}</div>
                    <div>Year: {year}</div>
                  </ReactTooltip>
                )
                return (<td key={uid}>{val}{tooltip}</td>)
              })}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  getHiddenRows() {
    const hiddenGroups = this.everyone.filter(dem => this.state[dem.id])
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
          {hiddenGroups.map(dem => (
            <span
              key={dem.id}
              onClick={this.unhideRow.bind(this, dem.id)}
              className={`token hidden-row ${dem.id}`}>
              {dem.display}
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