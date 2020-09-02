import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import * as chartActions from '../../actions/chart'
import baseStyle from './baseStyle'
import {connect} from 'react-redux'
import _ from 'lodash'
import './styles.css'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import colors, { rum, casablanca, jungleMist, stormGray } from './colors'
import Tooltip from '../../components/Tooltip'
import NestedBoxes from '../../components/NestedBoxes'
import KPTable from '../../components/KPTable'
import PolicyTable from '../../components/PolicyTable'
import DemographicsTable from '../../components/DemographicsTable'
import { TERM_MAP, TERMS } from '../../constants/glossary'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { CHARTS, FIELD_MAP } from '../../constants/charts'
import { getConfig } from './chartConfigs'
const HighchartsMore = require('highcharts/highcharts-more')
const Highcharts = require('highcharts')
const ReactHighcharts = require('react-highcharts').withHighcharts(Highcharts)
HighchartsMore(ReactHighcharts.Highcharts)

ReactHighcharts.Highcharts.theme = baseStyle
ReactHighcharts.Highcharts.setOptions(ReactHighcharts.Highcharts.theme)

const DEV = window.location.hostname === 'localhost'

// fix legend markers
// ReactHighcharts.Highcharts.seriesTypes.area.prototype.drawLegendSymbol = 
  // ReactHighcharts.Highcharts.seriesTypes.line.prototype.drawLegendSymbol
// ReactHighcharts.Highcharts.seriesTypes.scatter.prototype.drawDatalabels = 
  // ReactHighcharts.Highcharts.seriesTypes.line.prototype.drawDatalabels


// percentage marks on axis instead of yaxis label
// women men gap?

// const countryMap = {
//   Kenya: { population: '51.4 million', incomeClass: 'Low income', shiny: true },
//   Thailand: { population: '69.4 million', incomeClass: 'Upper-middle income', shiny: false },
// }

const URLBase = 'https://status.y-x.ch/query?'

const fields = _.flatMap(FIELD_MAP)

// const uncertaintyTooltipFormat = `<span style="color:{point.color}">●</span>
//   {series.name}: <b>{point.y}</b><br/>
//   Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
//   Source: UNAIDS` // todo: fill in actual source on point

const addAvg = arr => {
  if (_.isNumber(arr[0])) {
    return [...arr, _.mean(arr)]
  }

  return [...arr, { y: _.mean(_.map(arr, 'y')) }]
}

const dataHelper = (baseArray, variance=10, shift=0) => {
  return baseArray.map(n => n + shift + Math.floor(Math.random()*variance)-5)
}

class Dashboard extends Component {
  constructor() {
    super()
    this.state = { alertOn: false }
    // fields.forEach(f => this.state[f] = false)

    this.updateField = this.updateField.bind(this)
    this.updateAlert = this.updateAlert.bind(this)
    this.submit = this.submit.bind(this)
    this.submitDQ = this.submitDQ.bind(this)
  }
  componentWillMount() {
    const country = _.get(this, 'props.match.params.country', null)
    if (!country) {
      // TODO: check country existence
      this.props.history.go('/')
      console.error('no country!')
      return
    }
    this.props.actions.getChartData(country)
  }

  componentDidMount() {
    console.log('MOUNTED. ', this.props)
  }

  componentWillReceiveProps(newProps) {
    if (_.isEqual(newProps.chartData, this.props.chartData)) {
      console.error('what changed?')
      return
    }
  }

  getP95() {
    const { id, title } = CHARTS.P95

    const config = getConfig(id, this.props.chartData)

    if (!config) {
      return
    }

    const [status, art, suppression] = config.map(n => 
      Math.round((n)*100)+'%'
    )
    
    return (
      <div className='col-xl-4 col-md-6 col-xs-12 prog-95'>
        <div className='content'>
          <p>{title}</p>
          <NestedBoxes
            side={110}
            ratios={config}
            // colors={[colors[1]+'97', colors[2]+'97', colors[0]+'97', colors[0]+'40']}
            colors={[rum, casablanca, jungleMist, stormGray]}
            content={[
              { inner: status, below: 'of people living with HIV know their status' },
              { inner: art, below: 'of people living with HIV who know their status are on treatment' },
              { inner: suppression, below: 'of people on treatment are virally suppressed' },
            ]}
          />
        </div>
      </div>
    )
  }

  getCascade() {
    
  }

  getChart(id, tt) {
    if (_.isEmpty(this.props.chartData)) {
      console.log('No chart data (perhaps awaiting API response)')
      return
    }

    // if (!shiny) return

    const config = getConfig(id, this.props.chartData)
    const chart = <ReactHighcharts config={config} />

    return (
      <div className='chart-container col-xl-4 col-lg-6 col-sm-12'>
        {chart}
        {tt}
      </div>
    )
  }

  getPrevalence(shiny) {
    
  }

  getPrep() {
    const title = 'People Receiving Pre-Exposure Prophylaxis (PrEP)'
    const series = [
      {
        name: 'Women',
        color: colors[1],
        data: [11000, 13000, 25000],
      },
      {
        name: 'Men',
        color: colors[4],
        data: [14000, 15000, 29000],
      },
      {
        name: 'Trans',
        color: colors[8],
        data: [1200, 2100, 3900],
      },
      {
        name: 'TOTAL',
        color: colors[0],
        data: [26200, 30100, 57900]
      },
    ]
    const categories = ['2017', '2018', '2019']
    const options = {
      // plotOptions: { column: { stacking: 'normal' } }
    }
    return _.merge({}, getColumn({title, series, options, categories}))
  }

  getPrepStacked() {
    const title = 'People Receiving Pre-Exposure Prophylaxis (PrEP) [STACKED]'
    const series = [
      {
        name: 'Women',
        color: colors[1],
        data: [11000, 13000, 25000],
        stack: 'total'
      },
      {
        name: 'Men',
        color: colors[4],
        data: [14000, 15000, 29000],
        stack: 'total'
      },
      {
        name: 'Trans',
        color: colors[8],
        data: [1200, 2100, 3900],
        stack: 'total'
      },
    ]
    const categories = ['2017', '2018', '2019']
    const options = {
      plotOptions: { column: { stacking: 'normal' } }
    }
    return _.merge({}, getColumn({title, series, options, categories}))
  }

  getForecast() {
    const title = 'HIVST Forecast'
    const options = {
      subtitle: { text: 'WHO model estimates, 2020' },
      // plotOptions: { series: { pointStart: 2019 } }
    }
    const series = [
      {
        name: 'HIVSTs distributed',
        data: [ 
          { x: 2018, y: 8340 }, 
          { x: 2019, y: 9012 }, 
        ]
      },
      {
        name: 'HIVST forecast demand',
        data: [ 
          { x: 2020, y: 51023 }, 
          { x: 2021, y: 114389 }, 
          { x: 2022, y: 218324 }, 
          { x: 2023, y: 321092 }, 
          { x: 2024, y: 425203 }, 
          { x: 2025, y: 534324 }
        ]
      },
      {
        name: 'HIVST forecast need',
        type: 'line',
        data: [
          { x: 2020, y:812303 }, 
          { x: 2021, y:802343 }, 
          { x: 2022, y:813242 }, 
          { x: 2023, y:829238 }, 
          { x: 2024, y:832343 }, 
          { x: 2025, y:825232 }]
      }
    ]
    return _.merge({}, getColumnLine({title, series, options}))
  }

  getComp() {
    const title = 'Custom Comparison'
    const color = colors[8]
    const series = [
      {
        name: 'Indicator One (millions)',
        data: [
          { pointPlacement: -.5, y: 1, color: colors[4]+'20' }, 
          { pointPlacement: -.4, y: 2, color: colors[4]+'40' }, 
          { pointPlacement: -.3, y: 4, color: colors[4]+'80' }, 
          { pointPlacement: -.2, y: 8, color: colors[4] },  
          { pointPlacement: .2, y: 4, color: colors[1]+'20' }, 
          { pointPlacement: .3, y: 2, color: colors[1]+'40' }, 
          { pointPlacement: .4, y: 2, color: colors[1]+'80' }, 
          { pointPlacement: .5, y: 3, color: colors[1] }
        ],
        // color: ['red','red','red','red','blue','blue','blue','blue',]
      },
      {
        name: 'Indicator Two (%)',
        type: 'line',
        data: [21, 30, 43, 11,  41, 12, 15, 22],
        color
      }
    ]
    const options = {
      plotOptions: { column: { grouping: false }},
      yAxis: [
        {}, 
        {
          title: { style: { color } },
          labels: { style: { color } },
      }]
    }
    const categories = [
      '15 - 24','25 - 34','35 - 49','50+',
      '15 - 24','25 - 34','35 - 49','50+',
    ]
    return _.merge({}, getColumnScat({title, categories, series, options}))
  }  

  getAdults() {
    const title = 'Adults'
    const series = [
      {
        name: 'Number of tests conducted (thousands)',
        data: [234, 203]
      },
      {
        name: 'Positivity (%)',
        type: 'line',
        data: [2, 30]
      }
    ]
    const categories = ['Women', 'Men', 'TOTAL']

    // TODO should be weighted avg of %
    const options = {
      subtitle: { text: `Total tests: ${_.mean([234, 203])}k, Average positivity: ${_.mean([2, 30])}%` }
    }
    return _.merge({}, getColumnScat({title, series, options, categories}))
  }

  getCommunity() {
    const title = 'Community Testing Modalities'
    const series = [
      {
        name: 'Number of tests conducted (thousands)',
        data: [234, 238, 245]
      },
      {
        name: 'Positivity (%)',
        type: 'line',
        data: [12, 24, 30]
      }
    ]

    const options = {
      subtitle: { text: `Total tests: ${_.mean([234, 238, 245])}k, Average positivity: ${_.mean([12, 24, 30])}%` }
    } 
    const categories = ['Mobile Testing', 'VCT', 'Other', 'TOTAL']
    return _.merge({}, getColumnScat({title, series, options, categories}))
  }

  getFacility() {
    const title = 'Facility Testing Modalities'
    const series = [
      {
        name: 'Number of tests conducted (thousands)',
        tooltip: {
          // todo: delete if can be handled below (or in legend hover)
          // pointFormat:`<span style="color:{point.color}">●</span>
          //   {series.name}: <b>{point.y}</b><br/>
          //   Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
          //   Source: UNAIDS`,
        },
        data: [
          { y: 234 },
          { y: 238 },
          { y: 223 },
          { y: 243 },
          { y: 132 }
        ],
      },
      {
        name: 'Positivity (%)',
        tooltip: {
          pointFormat:`<span style="color:{point.color}">●</span>
          {series.name}: <b>{point.y}</b><br/>
          {point.tooltipAddition}`
        },
        type: 'line',
        data: [
          { y: 22 },
          { y: 30 },
          { y: 35 },
          { y: 19 },
          { y: 11, tooltipAddition: 'Description: something you should know about Other' }
        ],
      }
    ]


    const options = {
      subtitle: { text: `Total tests: ${_.meanBy([
          { y: 234 },
          { y: 238 },
          { y: 223 },
          { y: 243 },
          { y: 132 }
        ], 'y')}k, Average positivity: ${_.meanBy([
          { y: 22 },
          { y: 30 },
          { y: 35 },
          { y: 19 },
          { y: 11, tooltipAddition: 'Description: something you should know about Other' }
        ], 'y')}%` }
    }
    const categories = ['PITC', 'ANC', 'VCT', 'Family Planning Clinic', 'Other', 'TOTAL']
    // const options = { xAxis: { categories: ['Community', 'Facility']} }
    return _.merge({}, getColumnScat({title, options, categories, series}))
  }

  getIndex() {
    const title = 'Index'
    const series = [
      {
        name: 'Number of tests conducted (thousands)',
        data: [132, 232]
        // dataLabels,
      },
      {
        name: 'Positivity (%)',
        type: 'line',
        data: [21, 30]
      }
    ]
    const options = {
      subtitle: { text: `Total tests: ${_.mean([132, 232])}k, Average positivity: ${_.mean([21, 30])}%` }
    }
    const categories = ['Community', 'Facility', 'TOTAL']
    return _.merge({}, getColumnScat({title, options, categories, series}))
  }

  getSelf() {
    const title = 'HIV self-tests distributed'
    const series = [
      {
        name: 'number',
        color: colors[5],
        data: [67000],
      },
    ]
    const categories = ['HIV self-tests distributed']
    const options = {
      // plotOptions: { column: { stacking: 'normal' } }
      legend: { enabled: false }
    }
    return _.merge({}, getColumn({title, series, options, categories}))
  }

  getCountryContext() {
    console.log('gCC')
    const { id } = CHARTS.CONTEXT
    const population = _.get(this.props.chartData, id+'.data.population.value', 'UNKNOWN')
    const classification = _.get(this.props.chartData, id+'.data.classification.value_comment', 'UNKNOWN')
    return (
      <div className='col-xl-4 col-md-6 col-xs-12'>

        <div className='country-name'>
          <h1> {this.props.match.params.country}</h1>
        </div>
        <div className='country-details pb-3'>
          <div><span>Population:</span><span> {population}</span></div>
          <div><span>World Bank classification:</span><span> {classification}</span></div>

        </div>
      </div>
    )
  }
  
  render() {

    // const configCascade = this.getCascade()
    // const configConducted = this.getConducted()

    const ptt = (
      <Tooltip>
        <div>
          <div><b>Retests - PLHIV on ART:</b><span> Number of positive tests conducted in PLHIV already on ART. This is calculated by… Potential reasons for this type of testing include…</span></div>
          <div><b>Retests - Aware but not on ART:</b><span> Number of positive tests conducted in PLHIV aware of their HIV infection but not on ART. This is calculated by… Potential reasons for this type of testing include…</span></div>
          <div><b>New Diagnoses:</b><span> Number of positive tests returned that represent a newly identified HIV infection. This [does/does not] include retesting for verification prior to ART initiation as recommended by WHO. </span></div>
        </div>
      </Tooltip>
    )
    
    const diagnosis = this.getChart(CHARTS.PLHIV_DIAGNOSIS.id)
    const PLHIVAge = this.getChart(CHARTS.PLHIV_AGE.id)
    const PLHIVSex = this.getChart(CHARTS.PLHIV_SEX.id)
    const negative = this.getChart(CHARTS.HIV_NEGATIVE.id)
    const positive = this.getChart(CHARTS.HIV_POSITIVE.id, ptt)
    const prevalence = this.getChart(CHARTS.PREVALENCE.id)

    // const configPrevalence = this.getPrevalence(shiny)
    // const configPrep = this.getPrep()
    // const configPrepStacked = this.getPrepStacked()
    // const configForecast = this.getForecast()
    
    // const configComp = this.getComp()

    // const configAdults = this.getAdults()
    // const configCommunity = this.getCommunity()
    // const configFacility = this.getFacility()
    // const configIndex = this.getIndex()

    // const configSelf = this.getSelf()

    // const mIcon = this.getModeledIcon()

    return (
      <div className='dashboard'>
        <div className='nav'>
          <Link to='/'>
            <img className='who-logo' src='images/who_logo.png' alt='WHO logo' />
          </Link>
          <span className='title text-center'>
            HIV Testing Services Dashboard
          </span>
        </div>

        <div className='charts container-fluid mt-4 p-0'>
          <div className='row no-gutters mb-4'>

            {this.getCountryContext()}
            {this.getP95()}
          </div>

          <div className='row no-gutters'>

            {/* <div className='col-xl-4 col-md-6 col-sm-12'>
              <ReactHighcharts config={configCascade}/>
            </div> */}
            {diagnosis}
            {PLHIVSex}
            {PLHIVAge}
            {negative}
            {positive}
            {prevalence}
            {/* <div className='col-xl-4 col-md-6 col-sm-12'><ReactHighcharts config={configPrevalence}/></div> */}
          </div>

          {/* <div className='row no-gutters'>
            <h5 className='col-12 text-center mt-4 mb-2'>HIV tests conducted and positivity in the past year</h5>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12'><ReactHighcharts config={configAdults}/></div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12'><ReactHighcharts config={configCommunity}/></div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12'><ReactHighcharts config={configFacility}/></div>
            <div className='col-xl-3 col-lg-4 col-md-6 col-sm-12'><ReactHighcharts config={configIndex}/></div>
            <div className='col-xl-4 col-lg-6 col-md-6 col-sm-12'><ReactHighcharts config={configForecast} /></div>
          </div> */}

          {/* <div className='row no-gutters mt-5'>
            <KPTable classes='col-sm-12 col-md-7 p-3' />
            <PolicyTable classes='col-sm-12 col-md-5 p-3' />
            <DemographicsTable shiny={shiny} classes='p-3' />
          </div> */}

          <div className='row no-gutters mt-5'>
            <h3>Links to other sources</h3>
            <a className='col-xl-12' target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
              Shiny 90 Modelling Methodology
            </a>
            <a className='col-xl-12' target='_blank' rel='noopener noreferrer' href='http://lawsandpolicies.unaids.org'>
              UNAIDS - Laws and Policies
            </a>
            <a className='col-xl-12' target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
              WHO Paediatric HIV Testing
            </a>
            <a className='col-xl-12' target='_blank' rel='noopener noreferrer' href='https://www.who.int/hiv/prep/global-prep-coalition/en/'>
              Global PrEP Coalition
            </a>
            <a className='col-xl-12' target='_blank' rel='noopener noreferrer' href='https://cfs.hivci.org/'>
              WHO HIV Country Profiles
            </a>
            <a className='col-xl-12' target='_blank' rel='noopener noreferrer' href='https://master.dv1i2lva39jkq.amplifyapp.com/'>
              PROTOTYPE DASHBOARD (fake data)
            </a>
          </div>
          {this.getGlossary()}
          <br />
          <br />
          <br />
        
          {this.getDevSection()}
        </div>
      </div>
    )
  }

  getGlossary() {
    return(
      <div className='row no-gutters mt-5 glossary'>
        <div className='col-12'>
          <h2>Glossary</h2>
        </div>
        <div className='terms'>
          {TERMS.map(t => {
            return (
              <div className='term py-1'><strong>{t.term}</strong>: <span>{t.definition}</span></div>
            )
          })}
        </div>
      </div>
    )
  }

  // dev form

  getDevSection() {
    if (!DEV) return
    const inputs = fields.map(f => {
      return <label key={f}>{f}<input data-field={f} onChange={this.updateField}></input></label>
    })

    return (
      <div>
        <h5 className='text-center'>~ FOR DEVELOPMENT ~</h5>
        <h5>Color Palette</h5>
        {colors.map((c, i) => {
          return <span key={c} style={{background: c, width: '100px', height: '80px', color: 'white', display: 'inline-block'}}>{i}</span>
        })}
        <h5>Query API, results in devTools console</h5>
        {inputs}
        <button onClick={this.submit} action='#'>go fetch</button>
        <button onClick={this.submit.bind(this, true)} action='#'>dbug</button>
        <br />
        <span>{URLBase}indicator=</span><input id='direct-query'></input>
        <button onClick={this.submitDQ} action='#'>direct query</button>
        <button onClick={this.submitDQ.bind(this, true)} action='#'>dbug</button>
      </div>
    )
  }
  updateField(e) {
    this.setState({ [e.target.dataset.field]: e.target.value })
  }

  updateAlert(e) {
    this.setState({ alertOn: e.target.value === 'on' })
  }

  submitDQ(e, dbug) {
    const v = document.querySelector('#direct-query')
    // debugger
    const url = URLBase + 'indicator=' + v.value || ''
    console.log('url: ', url)
    fetch(url)
    .then(response => response.json())
    .then(r => {
      console.log(r)
      if (dbug) {
        debugger
      }
    })
  }

  submit(e, dbug) {
    let url = URLBase
    let char = ''
    fields.forEach(f => {
      if (this.state[f]) {
        url += encodeURI(`${char}${f}=${this.state[f]}`)
        char = '&'
      }
    })
    console.log('URL: ', url)
    fetch(url)
      .then(response => response.json())
      .then(r => {
        console.log(r)
        if (dbug) {
          debugger
        }
      })
  }
}

export default connect(
  state => ({
    chartData: state.chart.chartData
  }),
  dispatch => ({
    actions: bindActionCreators(chartActions, dispatch)
  })
)(Dashboard)
