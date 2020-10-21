import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import * as chartActions from '../../actions/chart'
import baseStyle from './baseStyle'
import {connect} from 'react-redux'
import _ from 'lodash'
import './styles.css'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import colors, { P95ColorA, P95ColorB, P95ColorC, P95ColorD } from './colors'
import Tooltip from '../../components/Tooltip'
import NestedBoxes from '../../components/NestedBoxes'
import KPTable from '../../components/KPTable'
import PolicyTable from '../../components/PolicyTable'
import DemographicsTable from '../../components/DemographicsTable'
import { TERM_MAP, TERMS } from '../../constants/glossary'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { CHARTS, FIELD_MAP, BASE_URL, SOURCE_DISPLAY_MAP } from '../../constants/charts'
import { getConfig, displayNumber, getExportData } from './chartConfigs'
import { COUNTRIES, COUNTRY_MAP } from '../../components/Homepage/countries'
import ReactTooltip from 'react-tooltip'
const HighchartsMore = require('highcharts/highcharts-more')
const Highcharts = require('highcharts')
const ReactHighcharts = require('react-highcharts').withHighcharts(Highcharts)
HighchartsMore(ReactHighcharts.Highcharts)

ReactHighcharts.Highcharts.theme = baseStyle
ReactHighcharts.Highcharts.setOptions(ReactHighcharts.Highcharts.theme)

const DEV = window.location.hostname === 'localhosty'

// fix legend markers
// ReactHighcharts.Highcharts.seriesTypes.area.prototype.drawLegendSymbol = 
  // ReactHighcharts.Highcharts.seriesTypes.line.prototype.drawLegendSymbol
// ReactHighcharts.Highcharts.seriesTypes.scatter.prototype.drawDatalabels = 
  // ReactHighcharts.Highcharts.seriesTypes.line.prototype.drawDatalabels


// percentage marks on axis instead of yaxis label
// women men gap?

const fields = _.flatMap(FIELD_MAP)

// const uncertaintyTooltipFormat = `<span style="color:{point.color}">●</span>
//   {series.name}: <b>{point.y}</b><br/>
//   Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
//   Source: UNAIDS` // todo: fill in actual source on point

class Dashboard extends Component {
  constructor() {
    super()
    this.state = { alertOn: false, loading: true }
    // fields.forEach(f => this.state[f] = false)

    this.updateField = this.updateField.bind(this)
    this.updateAlert = this.updateAlert.bind(this)
    this.submit = this.submit.bind(this)
    this.submitDQ = this.submitDQ.bind(this)
    this.goToCountry = this.goToCountry.bind(this)
    this.exportData = this.exportData.bind(this)
  }
  componentWillMount() {
    const countryCode = _.get(this, 'props.match.params.countryCode', '').toUpperCase()
    if (!COUNTRY_MAP[countryCode]) {
      this.props.history.push('/')
      console.error('no country!')
      return
    }
    this.props.actions.getChartData(countryCode)
  }
  
  componentDidMount() {
    console.log('MOUNTED. ', this.props)
  }
  
  componentWillReceiveProps(newProps) {
    const d = new Date()
    
    const dataCountry = newProps.chartData.countryCode
    // console.log('### newprops from ', dataCountry, ' at ', d.getMinutes()+':'+d.getSeconds())
    const paramCountry = _.get(newProps, 'match.params.countryCode').toUpperCase()
    // console.log('### newurl PARAM of: ', paramCountry)
    const loading = paramCountry !== dataCountry
    // console.log('### loading: ', loading)
    this.setState({ loading })
    
    if (loading) {
      this.props.actions.getChartData(paramCountry)
    }

    if (_.isEqual(newProps.chartData.countryCode, this.props.chartData.countryCode)) {
      console.error('what changed?')
      return
    }
  }

  getCountryContext() {
    const { id } = CHARTS.CONTEXT

    const populationRow = _.get(this.props.chartData, id + '.data.population', {})
    const population = populationRow[FIELD_MAP.VALUE]
    const pSource = populationRow[FIELD_MAP.SOURCE_DATABASE]
    
    const classificationRow = _.get(this.props.chartData, id + '.data.classification', {})
    const classification = classificationRow[FIELD_MAP.VALUE_COMMENT]
    const cSource = classificationRow[FIELD_MAP.SOURCE_DATABASE]
    
    const countryCode = _.get(this, 'props.match.params.countryCode', null)
    const name = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'name'])
    
    const tooltipIdPop = this.props.chartData.countryCode + 'population-tooltip'
    
    const tooltipPop = (
      <ReactTooltip id={tooltipIdPop} className='td-tooltip' type='dark' effect='solid'>
        <div>Source: {SOURCE_DISPLAY_MAP[pSource] || pSource}</div>
        <div>Year: {populationRow.year}</div>
      </ReactTooltip>
    )
    
    const tooltipIdClass = this.props.chartData.countryCode + 'classification-tooltip'
    const tooltipClass = (
      <ReactTooltip id={tooltipIdClass} className='td-tooltip' type='dark' effect='solid'>
        <div>Source: {SOURCE_DISPLAY_MAP[cSource] || cSource}</div>
        <div>Year: {classificationRow.year}</div>
      </ReactTooltip>
    )
    return (
      <div className='col-xl-6 col-lg-6 col-xs-12 country-context'>
        <div className='card-stock'>
          <div className='content'>
            <p className='name'>{name}</p>
            <div className='details'>
              {population && <span className='detail'>
                <p className='title'>Population </p>
                <a data-tip data-for={tooltipIdPop}>
                  <p className='value'>{displayNumber({ v: population })}</p>
                  {tooltipPop}
                </a>
              </span>}
              {classification && <span className='detail'>
                <p className='title'>World Bank classification </p>
                <a data-tip data-for={tooltipIdClass}>
                  <p className='value'>{classification}</p>
                  {tooltipClass}
                </a>
              </span>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  getP95() {
    const { id, title } = CHARTS.P95

    const config = getConfig(id, this.props.chartData)

    if (!config) {
      return
    }

    const [status, art, suppression] = config.map(n => 
      Math.round((n)*100)
    )

    const tooltipId = this.props.chartData.countryCode + 'p95-tooltip'
    
    const tooltip = (
      <ReactTooltip id={tooltipId} className='td-tooltip' type='dark' effect='solid'>
        <div>Source: {config.source}</div>
        <div>Year: {config.year}</div>
      </ReactTooltip>
    )
    
    return (
      <div className='col-xl-6 col-lg-6 col-xs-12 prog-95'>
        <div className='card-stock'>
          <div className='content'>
            {/* <p className='title'>{title}</p> */}
            <a data-tip data-for={tooltipId}>
            <NestedBoxes
              // circle={true}
              title={title}
              side={110}
              ratios={config}
              // colors={[colors[1]+'97', colors[2]+'97', colors[0]+'97', colors[0]+'40']}
              colors={[P95ColorA, P95ColorB, P95ColorC, P95ColorD]}
              content={[
                { inner: status, below: 'of people living with HIV know their status' },
                { inner: art, below: 'of people living with HIV who know their status are on treatment' },
                { inner: suppression, below: 'of people on treatment are virally suppressed' },
                // { inner: status, below: ['of people living with HIV', 'know their status'] },
                // { inner: art, below: ['of people living with HIV', 'who know their status', 'are on treatment'] },
                // { inner: suppression, below: ['of people on treatment are virally suppressed'] },
              ]}
            />
            </a>
            {tooltip}
          </div>
        </div>
      </div>
    )
  }

  getChart(id, tt) {
    if (_.isEmpty(this.props.chartData)) {
      console.log('No chart data (perhaps awaiting API response)')
      return
    }

    const countryCode = _.get(this, 'props.match.params.countryCode')
    // TODO: pass as prop?
    const shinyCountry = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'shiny'])
    const shinyChart = _.get(CHARTS, [id, 'shinyOnly'])

    if (shinyChart && !shinyCountry) {
      console.log(`${countryCode} is not shiny, skipping ${id} chart.`)
      return
    }

    let config = getConfig(id, this.props.chartData, shinyCountry)
    if (!config) {
      console.error(`${id} failed to produce a config.`)

      // show empty chart
      // const { title } = CHARTS[id]
      // config = _.merge({}, getLine({ title, series: [] }))
      return
    }
    const chart = <ReactHighcharts config={config} />
    // console.log('*** ', id, ' ****config:*** ', config)
    return (
      <div className='col-xl-4 col-lg-6 col-sm-12'>
        <div className='card-stock'>
          <div className='chart-container'>
            {chart}
            {tt}
          </div>
        </div>
      </div>
    )
  }

  getTable(id) {
    if (_.isEmpty(this.props.chartData)) {
      console.log('No chart data (perhaps awaiting API response)')
      return
    }

    const countryCode = _.get(this, 'props.match.params.countryCode')
    const shinyCountry = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'shiny'])

    let config = getConfig(id, this.props.chartData, shinyCountry)
    if (!config) {
      console.error(`${id} failed to produce a config.`)
      return // TODO do we want to produce blank table?
    }

    const Table = {
      [CHARTS.KP_TABLE.id]: KPTable,
      [CHARTS.GROUPS_TABLE.id]: DemographicsTable,
      [CHARTS.POLICY_TABLE.id]: PolicyTable,
    }[id]

    const classes = {
      [CHARTS.KP_TABLE.id]: 'col-sm-12 col-xl-5',
      [CHARTS.GROUPS_TABLE.id]: 'col-sm-12',
      [CHARTS.POLICY_TABLE.id]: 'col-sm-12 col-xl-7',
    }[id]

    if (!Table) {
      console.error(`${id} is not a valid table type.`)
      return
    }

    return (
      <div className={classes}>
        <div className='card-stock'>
          {/* <div className='chart-container'> */}
            {<Table config={config} iso={countryCode} />}
          {/* </div> */}
        </div>
      </div>
    )
  }

  getResourcesSection() {
    return (
      <div className='row resources-section'>

        <div className='col-12'>
          <h3>Links to other sources</h3>
          <div className='sources'>
            {/* <a target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
              Shiny 90 Modelling Methodology
            </a> */}
            <a target='_blank' rel='noopener noreferrer' href='https://cfs.hivci.org/'>
              WHO HIV Country Profiles
            </a>
            <a target='_blank' rel='noopener noreferrer' href='https://aidsinfo.unaids.org/'>
              UNAIDS AIDSinfo
            </a>
            <a target='_blank' rel='noopener noreferrer' href='http://lawsandpolicies.unaids.org'>
              UNAIDS - Laws and Policies
            </a>
            {/* <a target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
            WHO Paediatric HIV Testing
          </a> */}
            <a target='_blank' rel='noopener noreferrer' href='https://www.who.int/hiv/prep/global-prep-coalition/en/'>
              Global PrEP Coalition
            </a>
            {DEV && <a target='_blank' rel='noopener noreferrer' href='https://master.dv1i2lva39jkq.amplifyapp.com/'>
              PROTOTYPE DASHBOARD (fake data)
            </a>}
          </div>

        </div>

        <div className='col-12 pt-5'>
          <h3>Glossary</h3>
          <div className='terms'>
            {TERMS.map(t => {
              return (
                <div key={t.term} className='term py-1'>
                  <p className='name'>{t.term}</p>
                  <p className='definition'>{t.definition}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  goToCountry(e) {
    this.props.history.push('/' + e.target.value)
  }

  exportData() {
    const countryCode = _.get(this, 'props.match.params.countryCode')
    const shinyCountry = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'shiny'])  
    
    getExportData(this.props.chartData, countryCode, shinyCountry)
  }
  
  render() {

    // const ptt = (
    //   <Tooltip>
    //     <div>
    //       <div><b>Retests - PLHIV on ART:</b><span> Number of positive tests conducted in PLHIV already on ART. This is calculated by… Potential reasons for this type of testing include…</span></div>
    //       <div><b>Retests - Aware but not on ART:</b><span> Number of positive tests conducted in PLHIV aware of their HIV infection but not on ART. This is calculated by… Potential reasons for this type of testing include…</span></div>
    //       <div><b>New Diagnoses:</b><span> Number of positive tests returned that represent a newly identified HIV infection. This [does/does not] include retesting for verification prior to ART initiation as recommended by WHO. </span></div>
    //     </div>
    //   </Tooltip>
    // )
    
    const diagnosis = this.getChart(CHARTS.PLHIV_DIAGNOSIS.id)
    const PLHIVAge = this.getChart(CHARTS.PLHIV_AGE.id)
    const PLHIVSex = this.getChart(CHARTS.PLHIV_SEX.id)
    const negative = this.getChart(CHARTS.HIV_NEGATIVE.id)
    const positive = this.getChart(CHARTS.HIV_POSITIVE.id)
    const prevalence = this.getChart(CHARTS.PREVALENCE.id)
    const adults = this.getChart(CHARTS.ADULTS.id)
    const community = this.getChart(CHARTS.COMMUNITY.id)
    const facility = this.getChart(CHARTS.FACILITY.id)
    const index = this.getChart(CHARTS.INDEX.id)
    const forecast = this.getChart(CHARTS.FORECAST.id)
    
    const kp = this.getTable(CHARTS.KP_TABLE.id)
    const policy = this.getTable(CHARTS.POLICY_TABLE.id)
    const groups = this.getTable(CHARTS.GROUPS_TABLE.id)

    // const d = new Date()
    // console.log('### rendering ', this.props.chartData.countryCode, ' at ', d.getMinutes() + ':' + d.getSeconds())
    // console.log('### (url PARAM of: ', _.get(this, 'props.match.params.countryCode', '').toUpperCase() + ')')

    // console.log('### LOADING: ', this.state.loading)
    if (this.state.loading) {

      const countryCode = _.get(this, 'props.match.params.countryCode', null)
      const name = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'name'])
      return (
        <div className='loading-mask'>
          <p className='name'>{name}</p>
          <div className='squares'>
            <span style={{ backgroundColor: P95ColorA }} />
            <span style={{ backgroundColor: P95ColorB }} />
            <span style={{ backgroundColor: P95ColorC }} />
            <span style={{ backgroundColor: P95ColorD }} />
          </div>
          <p className='loading'>Loading...</p>
        </div>
      )
    }

    return (
      <div className='dashboard'>
        <div className='nav'>
          <Link className='who-logo' to='/'>
            <img src='images/who_logo.png' alt='WHO logo' />
          </Link>
          <span className='title text-center desktop'>HIV Testing Services Dashboard</span>
          <span className='title text-center mobile'>HIV Testing Services</span>
          <div className='input-group'>
            <select defaultValue={this.props.chartData.countryCode} onChange={this.goToCountry} className='custom-select'>
              {COUNTRIES.map(c => {
                return <option value={c.ISO} to={'/'+c.ISO} key={c.ISO}>{c.name}</option>
              })}
            </select>
          </div>
          <span className='export' onClick={this.exportData}>
              Export
          </span>
          <Link className='link-home' to='/'>
            Home
          </Link>
        </div>

        <div className='charts container-fluid mt-4 p-0'>
          <div className='row mb-4'>
          {/* <div className='row no-gutters mb-4'> */}

            {this.getCountryContext()}
            {this.getP95()}
          </div>

          <div className='row'>
          {/* <div className='row no-gutters'> */}
            {diagnosis}
            {PLHIVSex}
            {PLHIVAge}
            {negative}
            {positive}
            {prevalence}
            {adults}
            {community}
            {facility}
            {index}
            {forecast}
            <div className='col-12 mt-2'>&nbsp;</div>
            {kp}
            {policy}
            {groups}
          </div>
        </div>

        {this.getResourcesSection()}
      
        {this.getDevSection()}

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
        <br />
        <br />
        <br />
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
        <span>{BASE_URL}indicator=</span><input id='direct-query'></input>
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
    debugger
    const url = BASE_URL + 'indicator=' + v.value || ''
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
    let url = BASE_URL
    let char = ''
    fields.forEach(f => {
      if (this.state[f]) {
        let chunk = encodeURI(`${char}${f}=${this.state[f]}`)
        chunk = chunk.replace('+', '%2B') // TODO - figure out why not encoded properly
        url += chunk
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
