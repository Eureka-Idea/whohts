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

const DEV = window.location.hostname === 'localhost'

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
      // console.error('no country!')
      return
    }
    this.props.actions.getChartData(countryCode)
  }
  
  // componentDidMount() {
    // console.log('MOUNTED. ', this.props)
  // }
  
  componentWillReceiveProps(newProps) {
    const dataCountry = newProps.chartData.countryCode
    const paramCountry = _.get(newProps, 'match.params.countryCode').toUpperCase()
    const loading = paramCountry !== dataCountry
    this.setState({ loading })
    
    if (loading) {
      this.props.actions.getChartData(paramCountry)
    } else {
      this.registerGAEvent("event", "view_item", {
        value: paramCountry,
      })
    }

    // if (_.isEqual(newProps.chartData.countryCode, this.props.chartData.countryCode)) {
    //   console.error('what changed?')
    //   return
    // }
  }

  registerGAEvent() {
    try {
      window.dataLayer.push(arguments)
    } catch (error) {
      console.warn('gtag failed: ', error)
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
      <div className='col-xl-5 col-md-6 col-xs-12 country-context'>
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

    const getBoxes = (xl) => {

      return (
        <NestedBoxes
          // circle={true}
          classes={xl ? 'xl' : ''}
          title={title}
          bufferRatio={xl ? .8 : .2}
          lineHeight={xl ? 1.4 : 1.1}
          textBufferRatio={.2}
          firstSide={20}
          horizontal={xl}
          ratios={config}
          colors={[P95ColorA, P95ColorB, P95ColorC, P95ColorD]}
          content={[
            {
              inner: status,
              below: [
                'of people living with',
                'HIV know their status'
              ]
            },
            {
              inner: art,
              below: [
                'of people living with',
                'HIV who know their status',
                'are on treatment'
              ]
            },
            {
              inner: suppression,
              below: [
                'of people on treatment',
                'are virally suppressed'
              ]
            },
          ]}
        />
      )
    }
    
    return (
      <div className='col-xl-7 col-md-6 col-xs-12 prog-95'>
        <div className='card-stock'>
          <div className='content'>
            <p className='title vertical'>{title}</p>
            <p className='title stacked'>Progress<br/>towards<br/>95-95-95</p>
            <p className='title xl'>{title}</p>
            <a data-tip data-for={tooltipId}>
              {getBoxes()}
              {getBoxes(true)}
            </a>
            {tooltip}
          </div>
        </div>
      </div>
    )
  }

  getChart(id, tt) {
    if (_.isEmpty(this.props.chartData)) {
      // console.log('No chart data (perhaps awaiting API response)')
      return
    }

    const countryCode = _.get(this, 'props.match.params.countryCode')
    // TODO: pass as prop?
    const shinyCountry = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'shiny'])
    const shinyChart = _.get(CHARTS, [id, 'shinyOnly'])

    if (shinyChart && !shinyCountry) {
      // console.log(`${countryCode} is not shiny, skipping ${id} chart.`)
      return
    }

    let config = getConfig(id, this.props.chartData, shinyCountry)
    if (!config) {
      // console.error(`${id} failed to produce a config.`)

      // show empty chart
      // const { title } = CHARTS[id]
      // config = _.merge({}, getLine({ title, series: [] }))
      return
    }
    const chart = <ReactHighcharts config={config} />
    // console.log('*** ', id, ' ****config:*** ', config)

    const { title, columnChartHeader } = _.get(config, 'customHeader', {})
    let header = null
    if (columnChartHeader) {
      const {
        totalTests,
        totalSource,
        totalYear,
        averagePositivity,
        averageSource,
        averageYear,
      } = _.get(config, 'customHeader.subtitle')

      const tooltipId = this.props.chartData.countryCode + title.split(' ').join('-') + '-tooltip-'
      const tooltipIdTotal = tooltipId + '-total'
      const tooltipIdAverage = tooltipId + '-average'

      const tooltipTotal = (
        <ReactTooltip id={tooltipIdTotal} className='td-tooltip' type='dark' effect='solid'>
          <div>Source: {totalSource}</div>
          <div>Year: {totalYear}</div>
        </ReactTooltip>
      )
      
      const tooltipAverage = (
        <ReactTooltip id={tooltipIdAverage} className='td-tooltip' type='dark' effect='solid'>
          <div>Source: {averageSource}</div>
          <div>Year: {averageYear}</div>
        </ReactTooltip>
      )

      header = (
        <div className='custom-header'>
          <p className='chart-title'>{title}</p>
          <div className='chart-subtitle'>
            <a data-tip data-for={tooltipIdTotal}>
              <p className='total'><b>Total tests</b>: {totalTests||'N/A'}</p>
              {totalTests && tooltipTotal}
            </a>
            <a data-tip data-for={tooltipIdAverage}>
              <p className='average'><b>Average positivity</b>: {averagePositivity||'N/A'}</p>
              {averagePositivity && tooltipAverage}
            </a><br />
            <p>Programme data</p>
          </div>
        </div>
      )
    }

    const containerClasses = `chart-container ${id} ${(header ? 'with-custom-header' : '')}`
    
    return (
      <div className='col-xl-4 col-lg-6 col-sm-12'>
        <div className='card-stock'>
          {header}
          <div className={containerClasses}>
            {chart}
            {tt}
          </div>
        </div>
      </div>
    )
  }

  getTable(id) {
    if (_.isEmpty(this.props.chartData)) {
      // console.log('No chart data (perhaps awaiting API response)')
      return
    }

    const countryCode = _.get(this, 'props.match.params.countryCode')
    const shinyCountry = _.get(COUNTRY_MAP, [countryCode.toUpperCase(), 'shiny'])

    let config = getConfig(id, this.props.chartData, shinyCountry)
    if (!config) {
      // console.error(`${id} failed to produce a config.`)
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
      // console.error(`${id} is not a valid table type.`)
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
      <div className="row resources-section">
        <div className="col-12">
          <h3>Links to other sources</h3>
          <div className="sources">
            {/* <a target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
              Shiny 90 Modelling Methodology
            </a> */}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://cfs.hivci.org/"
            >
              WHO HIV Country Profiles
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://aidsinfo.unaids.org/"
            >
              UNAIDS AIDSinfo
            </a>
            {/* <a target='_blank' rel='noopener noreferrer' href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx'>
            WHO Paediatric HIV Testing
          </a> */}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.who.int/groups/global-prep-network"
            >
              Global PrEP Network
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://data.unicef.org/topic/hivaids/covid-19/ "
            >
              UNICEF
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://phia-data.icap.columbia.edu/visualization"
            >
              PHIA Project
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://data.pepfar.gov/"
            >
              PEPFAR Panorama Spotlight
            </a>
            {DEV && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://master.dv1i2lva39jkq.amplifyapp.com/"
              >
                PROTOTYPE DASHBOARD (fake data)
              </a>
            )}
          </div>
        </div>

        <div className="col-12 pt-5">
          <h3>Glossary</h3>
          <div className="terms">
            {TERMS.map((t) => {
              return (
                <div key={t.term} className="term py-1">
                  <p className="name">{t.term}</p>
                  <p className="definition">{t.definition}</p>
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

    const ptt = (
      <Tooltip>
        <div>
          <p>
            For countries with estimates from the Shiny90 model, the proportion of new diagnoses out of all positive tests is calculated for countries with annual data on the number adults tested and the number testing positive. 
          </p>

          <p>
            The Shiny90 model uses household surveys and HTS program data to estimate the rates of HIV testing among adults not living with HIV and those living with HIV. HIV testing rates are assumed to vary with calendar time, sex, age, previous HIV testing status, awareness of status, and, for PLHIV, CD4 cell count category as a marker of risk of AIDS-related symptoms motivating care-seeking and HIV testing. The proportion of PLHIV who know their status estimated by Shiny90 is bound by ART coverage (minimum) and the proportion of PLHIV who have ever been tested and received the results (maximum). 
          </p>

          <p>
            In addition to estimating the number of new diagnoses, the proportion of HIV positive tests that are retests is produced as a model output. This retesting proportion of all positive tests is large when the cumulative number of positive HIV tests is greater than the number of estimated PLHIV  that are undiagnosed, including those that are newly infected. The model calculates the proportion of diagnosed PLHIV who retest using a time-varying retesting rate ratio that is based on empirical evidence showing that retesting among PLHIV with known HIV status is common, ranging from 13% to 68% in many countries in SSA. Retesting among those who have already tested positive can be motivated by multiple factors, including the desire to confirm a previous test result or to avoid disclosing prior knowledge of HIV positive status when re-engaging with care after being lost to follow up due to societal stigma or denial. 
          </p>

          <p>
            For more details on the methods for calculating and interpreting retesting proportions from the Shiny90 model, see <a href='https://journals.lww.com/aidsonline/fulltext/2019/12153/national_hiv_testing_and_diagnosis_coverage_in.7.aspx' target='_blank'>Maheu-Giroux, M. et al. (2019) AIDS v33 p S255</a> and <a href='https://www.medrxiv.org/content/10.1101/2020.10.20.20216283v1' target='_blank'>Giguère, K. et al. (2020) preprint</a>.
          </p>
        </div>
      </Tooltip>
    )
    
    const diagnosis = this.getChart(CHARTS.PLHIV_DIAGNOSIS.id)
    const PLHIVAge = this.getChart(CHARTS.PLHIV_AGE.id)
    const PLHIVSex = this.getChart(CHARTS.PLHIV_SEX.id)
    const negative = this.getChart(CHARTS.HIV_NEGATIVE.id)
    const positive = this.getChart(CHARTS.HIV_POSITIVE.id, ptt)
    const prevalence = this.getChart(CHARTS.PREVALENCE.id)
    const adults = this.getChart(CHARTS.ADULTS.id)
    const community = this.getChart(CHARTS.COMMUNITY.id)
    const facility = this.getChart(CHARTS.FACILITY.id)
    const index = this.getChart(CHARTS.INDEX.id)
    const forecast = this.getChart(CHARTS.FORECAST.id)
    
    const kp = this.getTable(CHARTS.KP_TABLE.id)
    const policy = this.getTable(CHARTS.POLICY_TABLE.id)
    const groups = this.getTable(CHARTS.GROUPS_TABLE.id)

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
          <a className='who-logo' href='https://who.int/' target='_blank'>
            <img src='images/who_logo.png' alt='WHO logo' />
          </a>
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
            <div className='col-12 mt-2'>&nbsp;</div>
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
