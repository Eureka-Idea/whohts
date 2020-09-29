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
import { getConfig, displayNumber } from './chartConfigs'
import { COUNTRY_MAP } from '../../components/Homepage/countries'
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

// const URLBase = 'https://status.y-x.ch/query?'
const URLBase = 'https://eic-database-290813.ew.r.appspot.com/query?'

const fields = _.flatMap(FIELD_MAP)

// const uncertaintyTooltipFormat = `<span style="color:{point.color}">●</span>
//   {series.name}: <b>{point.y}</b><br/>
//   Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
//   Source: UNAIDS` // todo: fill in actual source on point

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
    const countryCode = _.get(this, 'props.match.params.countryCode', null)
    if (!countryCode) {
      // TODO: check country existence
      this.props.history.go('/')
      console.error('no country!')
      return
    }
    this.props.actions.getChartData(countryCode)
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
            circle={true}
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

  getChart(id, tt) {
    if (_.isEmpty(this.props.chartData)) {
      console.log('No chart data (perhaps awaiting API response)')
      return
    }

    const countryCode = _.get(this, 'props.match.params.countryCode')
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
      const { title } = CHARTS[id]
      config = _.merge({}, getLine({ title, series: [] }))
    }
    const chart = <ReactHighcharts config={config} />
    // console.log('*** ', id, ' ****config:*** ', config)
    return (
      <div className='chart-container col-xl-4 col-lg-6 col-sm-12'>
        {chart}
        {tt}
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

    if (!Table) {
      console.error(`${id} is not a valid table type.`)
      return
    }

    return (
      <div className='chart-container col-sm-12'>
        {<Table config={config} />}
      </div>
    )
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

    const countryCode = _.get(this, 'props.match.params.countryCode', null)  
    const name = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'name'])
    return (
      <div className='col-xl-4 col-md-6 col-xs-12'>

        <div className='country-name'>
          <h1>{name}</h1>
        </div>
        <div className='country-details pb-3'>
          <div><span>Population:</span><span> {displayNumber({ v: population })}</span></div>
          <div><span>World Bank classification:</span><span> {classification}</span></div>

        </div>
      </div>
    )
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

            {kp}
            {policy}
            {groups}
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

          <div className='row no-gutters mt-5 other-source-section'>
            <h3>Links to other sources</h3>
            <div className='sources'>
              {/* <a target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
                Shiny 90 Modelling Methodology
              </a> */}
              <a target='_blank' rel='noopener noreferrer' href='https://cfs.hivci.org/'>
                WHO HIV Country Profiles
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
            // let definition = t.definition.replace(/{{{[.*]\|[.*]}}}/g, )
            // _.each(t.links, (link, placeHolder) => {
            //   definition.replace(placeHolder)
            // })
            return (
              <div key={t.term} className='term py-1'><strong>{t.term}</strong>: <span>{t.definition}</span></div>
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
