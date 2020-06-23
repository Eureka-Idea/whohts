import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import * as chartActions from '../../actions/chart'
import baseStyle from './baseStyle'
import {connect} from 'react-redux'
import _ from 'lodash'
import './styles.css'
import { getArea, getColumn, getLine } from './configs'
import colors from './colors'
import Tooltip from '../../components/Tooltip'
const ReactHighcharts = require('react-highcharts')

ReactHighcharts.Highcharts.theme = baseStyle
ReactHighcharts.Highcharts.setOptions(ReactHighcharts.Highcharts.theme)

// fix legend markers
// ReactHighcharts.Highcharts.seriesTypes.area.prototype.drawLegendSymbol = 
  // ReactHighcharts.Highcharts.seriesTypes.line.prototype.drawLegendSymbol


// percentage marks on axis instead of yaxis label
// women men gap?

const URLBase = 'https://status.y-x.ch/query?'

const fields = ['indicator',
'indicator_description',
'contry_iso_code',
'country_name',
'area_name',
'geographic_scope',
'year',
'sex',
'age',
'population_segment',
'population_sub_group',
'value',
'value_comment',
'unit_format',
'source_organization',
'source_database',
'source_year',
'notes',
'modality',
'modality_category']

const chartNames = ['chart1', 'chart2']

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
    // console.log('hi', this.props.country)
    this.props.actions.getChartData(this.props.country)
  }

  componentDidMount() {
    console.log('mtd', this.props)
  }

  componentWillReceiveProps(newProps) {
    // TODO lodash / deep equal
    if (newProps.chartData === this.props.chartData) {
      console.error('what changed?')
      return
    }
    console.log('Configuring charts: ')
    this.configs = {}
    chartNames.forEach(c => {
      const rows = newProps.chartData[c]
      this.configs[c] = rows
    })
    console.log(this.configs)
  }

  getPLHIVWomen() {
    const title = 'Women'
    const categories = _.range(2000,2020)
    // const options = { plotOptions: { series: { pointStart: 2000 }}}
    const options = {
      legend: { layout: 'proximate', symbolWidth: 40 },
    }
    const baseSeries = [
      2, 3, 6,
      9,14,17,
      25,29,36,
      53,
    ]
    const series = [
      {
        name: '15 - 24',
        // color: colors[4]+'97',
        dashStyle: 'ShortDot',
        data: baseSeries,
      },
      {
        name: '25 - 34',
        // color: colors[4]+'97',
        dashStyle: 'DashDot',
        data: dataHelper(baseSeries, 8, 5),
      },
      {
        name: '35 - 49',
        // color: colors[4]+'97',
        dashStyle: 'LongDash',
        data: dataHelper(baseSeries, 6, 8),
      },
      {
        name: '50 - 99',
        color: colors[8],
        dashStyle: 'Solid',
        data: dataHelper(baseSeries, 4, 12),
      },
    ]
    return _.merge({}, getLine({title, series, categories, options}))
  }

  getPLHIVMen() {
    const title = 'Men'
    const categories = _.range(2010,2020)
    // const options = { plotOptions: { series: { pointStart: 2000 }}}
    const options = {
      legend: { layout: 'proximate', symbolWidth: 40 },
    }
    const baseSeries = [
      2, 3, 6,
      9,14,17,
      25,29,36,
      53,
    ]
    const series = [
      {
        name: '15 - 24',
        // color: colors[4]+'97',
        dashStyle: 'ShortDot',
        data: baseSeries,
      },
      {
        name: '25 - 34',
        // color: colors[4]+'97',
        dashStyle: 'DashDot',
        data: dataHelper(baseSeries, 8, 5),
      },
      {
        name: '35 - 49',
        // color: colors[4]+'97',
        dashStyle: 'LongDash',
        data: dataHelper(baseSeries, 6, 8),
      },
      {
        name: '50 - 99',
        color: colors[8],
        dashStyle: 'Solid',
        data: dataHelper(baseSeries, 4, 12),
      },
    ]
    return _.merge({}, getLine({title, series, categories, options}))
  }

  getPrevalence() {
    const title = 'Prevalence, Positivity & Diagnosis Yield'
    const categories = _.range(2000,2020)
    const options = { plotOptions: { series: { marker: { radius: 3 }}}}
    const series = [
      {
        name: 'HIV Prevalence',
        // color: colors[4]+'97',
        dashStyle: 'ShortDot',
        marker: { radius: 0 },
        lineType: 'line',
        data: [
          43,43,42,42,42,
          41,41,41,41,40,
          40,39,39,39,38,
          38,38,37,37,36,
        ],
      },
      {
        name: 'Positivity',
        // color: colors[4]+'97',
        // dashStyle: 'ShortDot',
        data: [
          2, 3, 3, 5, 6,
          9, 11,14,17,21,
          25,26,29,36,43,
          53,59,65,67,73,
        ].reverse(),
      },
      {
        name: 'Diagnostic Yield',
        // color: colors[4]+'97',
        // dashStyle: 'DashDot',
        data: dataHelper([
          2, 3, 3, 5, 6,
          9, 11,14,17,21,
          25,26,29,36,43,
          53,59,65,67,73,
        ], 8, 5).reverse(),
      },
      {
        name: 'Treatment Adjusted Prevalence',
        color: colors[9],
        // dashStyle: 'LongDash',
        data: dataHelper([
          2, 3, 3, 5, 6,
          9, 11,14,17,21,
          25,26,29,36,43,
          53,59,65,67,73,
        ], 6, 8).reverse(),
      },
    ]
    return _.merge({}, getLine({series, categories, options, title, spline:true}))
  }

  getConducted() {
    const title = 'HIV Tests Conducted'
    const categories = _.range(2000,2020)
    const series = [
      {
        name: 'HIV Negative',
        color: colors[4]+'97',
        data: [
          123,132,149,153,163,
          178,191,199,201,212,
          214,223,231,238,244,
          251,255,257,258,258
        ],
      },
      {
        name: 'HIV Positive',
        color: colors[9]+'90',
        data: [
          29,31,31,32,33,
          33,33,34,34,35,
          36,36,36,37,37,
          38,38,39,39,39
        ],
      },
    ]
    const options = {
      yAxis: { title: { text: 'Adults 15+ (millions)' } },
    }
    return _.merge({}, getArea({title, categories, series, options}))
  }

  getCascade() {
    const title = 'Treatment Cascade'
    const categories = _.range(2010,2020)
    const options = { 
      yAxis: { labels: { format: '{value}%' } },
      tooltip: { valueSuffix: '%' },
      // tooltip: { pointFormat: '{series.name}: <b>{point.y:.0f} million</b>' },
      // yAxis: { max: 58*2 },
     }
    const series = [
      {
        name: 'Undiagnosed PLHIV',
        color: colors[1]+'97',
        data: [
          14,13,13,12,12,
          12,11,10, 9, 9
        ],
      },
      {
        name: 'Diagnosed HIV positive but not on ART',
        color: colors[2]+'97',
        data: [
          38,40,41,44,45,
          45,48,50,53,55
        ].map(n => n-10),
      },
      {
        name: 'On ART',
        color: colors[0]+'97',
        data: [
          16,19,22,24,27,
          32,35,39,42,44
        ].map(n => n-6),
      },
    ]
    return _.merge({}, getArea({title, categories, series, options}))
  }

  getDistribution() {
    const title = 'Distribution of HIV+ Tests by Awareness & ART Status'
    const categories = _.range(2000,2020)
    const options = { 
      yAxis: { title: { text: 'Adults 15+ (millions)' } },
      tooltip: { pointFormat: '{series.name}: <b>{point.y:.0f} million</b>' },
      // yAxis: { max: 58*2 },
     }
    const series = [
      {
        name: 'Retests - PLHIV on ART',
        color: colors[1]+'97',
        data: [
          1,2,4,10,16,
          31,39,46,64,78,
          84,81,80,89,94,
          // 84,86,82,83,84,
          77,72,68,61,54
        ],
      },
      {
        name: 'Retests - Aware but not on ART',
        color: colors[2]+'97',
        data: [
          1,2,4,9,15,
          26,37,42,59,69,
          62,65,64,54,53,
          // 43,36,33,31,20,
          18,15,9,11,8,
        ],
      },
      {
        name: 'New Diagnoses',
        color: colors[0]+'97',
        data: [
          1,2,4,5,5,
          6,7,7,9,9,
          12,15,14,14,13,
          // 13,12,13,11,10,
          10,11,9,9,8,
        ],
      },
    ]
    return _.merge({}, getArea({title, categories, series, options}))
  }

  getAdults() {
    const title = 'Adults'
    const series = [
      {
        name: 'Total Tests',
        data: [
          ['Women', 234],
          ['Men', 238],
        ],
      },
      {
        name: 'Positivity (%)',
        data: [
          ['Women', 2.234322],
          ['Men', 30.234328],
        ],
      }
    ]
    return _.merge({}, getColumn({title, series}))
  }

  getCommunity() {
    const title = 'Community Testing Modalities'
    const series = [
      {
        name: 'Total Tests',
        data: [
          ['Mobile Testing', 234],
          ['VCT', 238],
          ['Other', 2],
        ],
      },
      {
        name: 'Positivity (%)',
        data: [
          ['Mobile Testing', 2.234322],
          ['VCT', 30.234328],
          ['Other', 30.2343],
        ],
      }
    ]
    return _.merge({}, getColumn({title, series}))
  }

  getFacility() {
    const title = 'Facility Testing Modalities'
    const series = [
      {
        name: 'Total Tests',
        data: [
          ['PITC', 234],
          ['ANC', 238],
          ['VCT', 223],
          ['Family Planning Clinic', 243],
          ['Other', 122],
        ],
      },
      {
        name: 'Positivity (%)',
        data: [
          ['PITC', 2.234322],
          ['ANC', 30.234328],
          ['VCT', 35.2343],
          ['Family Planning Clinic', 20.2343],
          ['Other', 10.2343],
        ],
      }
    ]
    return _.merge({}, getColumn({title, series}))
  }

  getIndex() {
    const title = 'Index'
    const series = [
      {
        name: 'Total Tests',
        data: [
          ['Community', 123],
          ['Facility', 232],
        ],
      },
      {
        name: 'Positivity (%)',
        data: [
          ['Community', 21.34],
          ['Facility', 34],
        ],
      }
    ]
    return _.merge({}, getColumn({title, series}))
  }
  
  render() {
    // console.log('NNNNNNN',this.props.chartData)
    const inputs = fields.map(f => {
      return <label key={f}>{f}<input data-field={f} onChange={this.updateField}></input></label>
    })

    const configPLHIVWomen = this.getPLHIVWomen()
    const configPLHIVMen = this.getPLHIVMen()
    const configPrevalence = this.getPrevalence()
    const configConducted = this.getConducted()
    const configCascade = this.getCascade()
    const configDistribution = this.getDistribution()
    const configAdults = this.getAdults()
    const configCommunity = this.getCommunity()
    const configFacility = this.getFacility()
    const configIndex = this.getIndex()
    
    return (
      <div className='dashboard'>

        <div className='nav'>
          <a onClick={this.props.setCountry.bind(null, null)} action='#' title='go home'>
            <img className='who-logo' src='images/who_logo.png' alt='WHO logo' />
          </a>
          <span className='title text-center'>
            HIV Testing Services Dashboard
          </span>
        </div>

        <div className='charts container-fluid mt-4'>
          <div className='country-name'>
            <h1> {this.props.country}</h1>
          </div>
          <div className='country-details pb-3'>
            <div><span>Population:</span><span> 51.4 million</span></div>
            <div><span>World Bank classification:</span><span> Low income</span></div>
          </div>

          <div className='row no-gutters'>

            <div className='col-xl-4 col-md-6 col-sm-12'>
              <Tooltip> 
                <span className='text-center'>
                  <p>[ boxes ]</p>
                  <em>visual demonstrating nesting percentages</em>
                </span>
              </Tooltip>
              <ReactHighcharts config={configCascade}/>
            </div>
            <div className='col-xl-4 col-md-6 col-sm-12'><ReactHighcharts config={configPLHIVWomen}/></div>
            <div className='col-xl-4 col-md-6 col-sm-12'><ReactHighcharts config={configPLHIVMen}/></div>

            <div className='col-xl-4 col-md-6 col-sm-12'><ReactHighcharts config={configConducted}/></div>
            <div className='col-xl-4 col-md-6 col-sm-12'>
              <Tooltip> 
                <div>
                  <div><b>Retests - PLHIV on ART:</b><span> Number of positive tests conducted in PLHIV already on ART. This is calculated by… Potential reasons for this type of testing include…</span></div>
                  <div><b>Retests - Aware but not on ART:</b><span> Number of positive tests conducted in PLHIV aware of their HIV infection but not on ART. This is calculated by… Potential reasons for this type of testing include…</span></div>
                  <div><b>New Diagnoses:</b><span> Number of positive tests returned that represent a newly identified HIV infection. This [does/does not] include retesting for verification prior to ART initiation as recommended by WHO. </span></div>
                </div>
              </Tooltip>
              <ReactHighcharts config={configDistribution}/>
            </div>
            <div className='col-xl-4 col-md-6 col-sm-12'><ReactHighcharts config={configPrevalence}/></div>
          </div>

          <div className='row no-gutters'>
            <div className='col-xl-3 col-lg-6 col-sm-12'><ReactHighcharts config={configAdults}/></div>
            <div className='col-xl-3 col-lg-6 col-sm-12'><ReactHighcharts config={configCommunity}/></div>
            <div className='col-xl-3 col-lg-6 col-sm-12'><ReactHighcharts config={configFacility}/></div>
            <div className='col-xl-3 col-lg-6 col-sm-12'><ReactHighcharts config={configIndex}/></div>
          </div>
          <br />
          <br />
          <br />
        
          <h5 className='text-center'>~ FOR DEVELOPMENT ~</h5>
          <h5>Color Palette</h5>
          {colors.map((c, i) => {
            return <span style={{background: c, width: '100px', height: '80px', color: 'white', display: 'inline-block'}}>{i+1}</span>
          })}
          <h5>Query API, results -> devTools console</h5>
          {inputs}
          <button onClick={this.submit} action='#'>go fetch</button>
          <button onClick={this.submit.bind(this, true)} action='#'>dbug</button>
          <br />
          <span>{URLBase}indicator=</span><input id='direct-query'></input>
          <button onClick={this.submitDQ} action='#'>direct query</button>
          <button onClick={this.submitDQ.bind(this, true)} action='#'>dbug</button>
        </div>
      </div>
    )
  }

  // dev form
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
