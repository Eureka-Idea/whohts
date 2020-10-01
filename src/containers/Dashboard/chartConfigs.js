import colors, {femaleColor, maleColor, barChartAccent, barChartColorDark } from "./colors"
import _ from 'lodash'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import { CHARTS, R_2015_2019, FIELD_MAP, AGE_MAP, SOURCE_DB_MAP, SOURCE_DISPLAY_MAP } from "../../constants/charts";
import { TERM_MAP } from "../../constants/glossary";

// __________________________ HELPERS ____________________________________

// const uncertaintyTooltipFormat = `
//   <span style="color:{point.color}">●</span>
//   {series.name}: <b>{point.y}</b><br/>
//   Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
//   Year: {point.x}
//   Source: {point.source}
//   `

// const sourceTooltipFormat = `
//   <span style="color:{point.color}">●</span>
//   {series.name}: <b>{point.y}</b><br/>
//   Year: <b>{point.year}</b><br/>
//   Source: <b>{point.source}</b><br/>
//   `
  // Source year: <b>{point.sourceYear}</b><br/>

const barChartsTestsName = 'Number of tests conducted'
const barChartsPositivityName = 'Positivity' // TODO: acceptable?
// const barChartsPositivityNameTooltip = 'Positivity'

function adjustPercentage({ row, toDisplay=false, decimals=0 }) {
  if (!row) {
    console.warn('No % to adjust')
    return null
  }
  
  let {
    [FIELD_MAP.VALUE]: v,
    [FIELD_MAP.INDICATOR]: indicator,
    [FIELD_MAP.SOURCE_DATABASE]: source,
    [FIELD_MAP.INDICATOR_DESCRIPTION]: description,
  } = row

  if (!_.isNumber(v)) {
    console.warn('No % to adjust')
    return null
  }

  // NOTE: ** conditional source tweak **
  // console.log('*** source ***', source)
  // console.log('*** indicator ***', indicator.toLowerCase())
  // console.log('*** indicator desc ***', row[FIELD_MAP.INDICATOR_DESCRIPTION])
  // console.log('*** v ***', v)
  if (description === 'PEPFAR Calculated Indicator') {
    // console.log('***YUP')
    v *= 100
  }
  if (toDisplay) {
    v = displayPercent({ v, decimals })
  }
  return v
}
function displayNumber({ v, unrounded=false }) {
  if (!_.isNumber(v)) {
    console.warn('NaN fed to displayNumber: ', v)
    return null
  }

  if (v > 1000000) {
    return _.round(v/1000000, 1).toString() + ' million'
  }
  if (v < 100) {
    return '<100'
  }
  if (v < 200) {
    return '<200'
  }
  if (v < 500) {
    return '<500'
  }
  if (v < 1000) {
    return '<1000'
  }
  
  // still make sure unrounded # is an integer
  let str = unrounded ? _.round(v).toString() : Number(v.toPrecision(2)).toString()
  let spaced = ''
  let spacer = ''
  let slStart
  while (str.length) {
    spaced = str.slice(-3) + spacer + spaced
    str = str.slice(0, -3)
    spacer = ' '
  }

  return spaced
}
function displayPercent({ v, adjust=false, decimals=0 }) {
  if (!_.isNumber(v)) {
    console.warn('NaN fed to displayPercent: ', v)
    return null
  }
  const val = adjust ? (v * 100) : v

  if (val > 100) {
    console.warn('Incorrect %')
  }
  if (val < .1) {
    return '<0.1%'
  }
  if (val < .5 && !decimals) {
    return '<0.5%'
  }
  let str = _.round(val, decimals).toString()
  if (!str.includes('.') && decimals) {
    str += '.0' // TODO: this doesn't accommodate decimals > 1
  }
  return str + '%' 
}

// function sourceTooltipFormatter () {

// return `
//     <span style="color:${this.color}">●</span>
//     ${this.series.name}: <b>${displayNumber({ v: this.y })}</b><br/>
//     ${!this.source ? '' : `Source: <b>${this.source}</b>`}
//     `
//     // Year: <b>${this.year}</b><br/>
// }
function percentSourceTooltipFormatter () {
  const decimals = this.decimals || 1 // intended for column charts (positivity gets 1)
  
  return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayPercent({ v: this.y, decimals })}</b><br/>
    Year: <b>${this.year}</b><br/>
    ${!this.source ? '' : `Source: <b>${this.source}</b>`}
  `
}
function uncertaintyTooltipFormatter () {
  const uncertaintyLine = (!this.l || !this.u) ? '' : `Uncertainty range: <b>${displayNumber({ v: this.l })} - ${displayNumber({ v: this.u })}</b><br />`
  
  return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayNumber({ v: this.y })}</b><br />
    ${uncertaintyLine}
    ${!this.source ? '' : `Source: <b>${this.source}</b>`}
    `
    // Year: ${this.x}<br />
}
function percentUncertaintyTooltipFormatter () {
  const decimals = this.decimals || 0
  const lVal = displayPercent({ v: this.l, decimals })
  const uVal = displayPercent({ v: this.u, decimals })
  const uncertaintyLine = (!lVal || !uVal) ? '' : `Uncertainty range: <b>${lVal} - ${uVal}</b><br />`
  
  return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayPercent({ v: this.y, decimals })}</b><br />
    ${uncertaintyLine}
    ${!this.source ? '' : `Source: <b>${this.source}</b>`}
    `
    // Year: ${this.x}<br />
}

function getSubtitle(total, pTotal) {
  const {
    [FIELD_MAP.SOURCE_DATABASE]: source,
    [FIELD_MAP.YEAR]: year,
  } = total
  const tooltip = `Source: ${SOURCE_DISPLAY_MAP[source]||source}\nYear: ${year}`

  const {
    [FIELD_MAP.SOURCE_DATABASE]: pSource,
    [FIELD_MAP.YEAR]: pYear,
  } = pTotal
  const pTooltip = `Source: ${SOURCE_DISPLAY_MAP[pSource]||pSource}\nYear: ${pYear}`

  const formattedTotal = displayNumber({ v: total.value, unrounded: true })
  const adjustedPTotal = adjustPercentage({ row: pTotal, toDisplay: true, decimals: 1 })
  
  return `<div><span title="${tooltip}"><b>Total tests</b>: ${formattedTotal||'N/A'}</span> 
  <span title="${pTooltip}"><b>Average positivity</b>: ${adjustedPTotal||'N/A'}</span><br /><span>Programme Data</span></div>` 
}

function getPlotPoints({ row, year, adjust=false, decimals=0}) {
  const x = Number(year || _.get(row, [FIELD_MAP.YEAR]))
  if (!row || !row.value) {
    return [{ x, y: null }, { x, y: null }]
  }
  let {
    [FIELD_MAP.VALUE]: y,
    [FIELD_MAP.VALUE_LOWER]: l,
    [FIELD_MAP.VALUE_UPPER]: u,
    [FIELD_MAP.SOURCE_DATABASE]: source,
  } = row

  source = SOURCE_DISPLAY_MAP[source] || source

  if (adjust) {
    y *= 100

    if (_.isNumber(l)) {
      l *= 100
    }
    if (_.isNumber(u)) {
      u *= 100
    }
  }

  const point = { x, year: x, y, l, u, source, decimals }
  const rPoint = [l, u]
  return [point, rPoint]
}

// __________________________________________________________________

const getConfig = (chartId, chartData, shinyCountry) => {
  if (_.isEmpty(chartData)) {
    console.log('No chart data (perhaps awaiting API response)')
    return
  }
  
  const getterMap = {
    [CHARTS.P95.id]: getP95,
    [CHARTS.PLHIV_DIAGNOSIS.id]: getPlhivDiagnosis,
    [CHARTS.PLHIV_SEX.id]: getPlhivSex,
    [CHARTS.PLHIV_AGE.id]: getPlhivAge,
    [CHARTS.HIV_NEGATIVE.id]: getHivNegative,
    [CHARTS.HIV_POSITIVE.id]: getHivPositive,
    [CHARTS.PREVALENCE.id]: getPrevalence,
    [CHARTS.ADULTS.id]: getAdults,
    [CHARTS.COMMUNITY.id]: getCommunity,
    [CHARTS.FACILITY.id]: getFacility,
    [CHARTS.INDEX.id]: getIndex,
    [CHARTS.FORECAST.id]: getForecast,
    [CHARTS.KP_TABLE.id]: getKpTable,
    [CHARTS.POLICY_TABLE.id]: getPolicyTable,
    [CHARTS.GROUPS_TABLE.id]: getGroupsTable,
  }
  const getter = getterMap[chartId]
  if (!getter) {
    console.error('No config for chart type: ', chartId)
    return
  }

  const data = _.get(chartData, [chartId, 'data'])
  if (!data) {
    console.error(chartId + ' has no data')
    return
  }

  console.log(chartId, ' data: ', data)

  try {
    return getter(data, shinyCountry)
  } catch (error) {
    console.error(chartId, ' unable to generate config: ', error)
    return
  }  
}

const extractPrioritizedData = (data, indicatorIds, sourceCount, defaultValue=undefined) => {
  const result = { missingIndicators: [] }
  _.each(indicatorIds, ind => {

    for (let i = 1; i <= sourceCount; i++) {
      const indicatorResult = _.get(data, ind+i, null)
      if (indicatorResult && indicatorResult[FIELD_MAP.VALUE]) {
        result[ind] = indicatorResult
        break
      } else if (i === sourceCount) {
        result[ind] = { value: defaultValue, noData: true, [FIELD_MAP.SOURCE_DATABASE]: 'no data' }
        result.missingIndicators.push(ind)
      }
    }
    
  })

  return result
}

const extractPrioritizedRangeData = ({ data, indicatorIds, sourceCount, sourceCountMap={}, indicatorRangeMap, mappedData=false, rangedField='year' }) => {
  const result = { missingIndicatorMap: {} }
  _.each(indicatorIds, ind => {

    let ranges = indicatorRangeMap[ind] || indicatorRangeMap.ALL
    if (!ranges) {
      console.error('No ranges provided for indicator: ', ind)
      return
    }
    ranges = mappedData ? _.mapKeys(ranges) : ranges
    const mapper = mappedData ? _.mapValues : _.map

    result[ind] = mapper(ranges, (range, ri) => {
      const count = sourceCountMap[ind] || sourceCount

      for (let i = 1; i <= count; i++) {
        // eg _.get({ ind1: [ 3, null ], ind2: [1, 5] }, ['ind'+2, 1]) => 5
        const selector = mappedData ? range : ri
        const indicatorResult = _.get(data, [ind+i, selector], null)
        if (indicatorResult && indicatorResult[FIELD_MAP.VALUE]) {
          return indicatorResult
        } else if (i === count) {
          _.set(result.missingIndicatorMap, [ind, range], true)
          return { value: 0, [rangedField]: range, noData: true, [FIELD_MAP.SOURCE_DATABASE]: 'no data' }
        }
      }

    })

  })

  return result
}

const getP95 = data => {
  const config = ['status', 'art', 'suppression'].map(ind => {
    const indVal = _.get(data, [ind, 'value'])
    return indVal / 100
  })

  return config
}

const getPlhivDiagnosis = data => {
  const { title } = CHARTS.PLHIV_DIAGNOSIS

  // colors: 17 11 5

  const options = {
    // yAxis: { labels: { format: '{value}%' } },
    subtitle: { text: 'Spectrum model estimates (UNAIDS, 2020)' },
    // tooltip: { valueSuffix: ' million' },
    yAxis: { title: { text: 'Adults 15+' } },
    // plotOptions: { series: { pointStart: 2015 } }
    // tooltip: { pointFormat: '{series.name}: <b>{point.y:.0f} million</b>' },
    // yAxis: { max: 58*2 },
  }

  const undiagnosedData = []
  const notArtData = []
  const onArtData = []
  
  R_2015_2019.forEach((y, i) => {
    // TODO: calc uci/lci
    // const onArtValue = _.get(yearRecord, 'median.value')
    const onArtRow = _.get(data, ['onArt', i])
    const [onArtPoint] = getPlotPoints({ row: onArtRow, year: y })
    const plhivRow = _.get(data, ['plhiv', i])
    const [plhivPoint] = getPlotPoints({ row: plhivRow, year: y })
    const knowRow = _.get(data, ['know', i])
    const [knowPoint] = getPlotPoints({ row: knowRow, year: y })

    let undiagnosedPoint, notArtPoint
    if (plhivPoint.y) {
      if (knowPoint.y) {
        // cannibalize knowPoint for its year, source etc
        undiagnosedPoint = knowPoint
        undiagnosedPoint.y = (plhivPoint.y - knowPoint.y)
      }
      if (onArtPoint.y) {
        // cannibalize plhivPoint for its year, source etc
        notArtPoint = plhivPoint
        notArtPoint.y = (plhivPoint.y - onArtPoint.y)
      }
    }
    
    onArtData.push(onArtPoint)
    notArtData.push(notArtPoint)
    undiagnosedData.push(undiagnosedPoint)
  })
  
  const series = [
    {
      name: 'Undiagnosed PLHIV',
      description: TERM_MAP.undiagnosedPlhiv.definition,
      color: colors[2],
      data: undiagnosedData,
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
    },
    {
      name: 'PLHIV know status not on ART',
      description: TERM_MAP.plhivWhoKnowStatusNotOnArt.definition,
      color: colors[1],
      data: notArtData,
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
    },
    {
      name: 'PLHIV know status on ART',
      description: TERM_MAP.plhivKnowStatusOnArt.definition,
      color: colors[0],
      data: onArtData,
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
    },
  ]
  return _.merge({}, getArea({ title, series, options }))
}

const getPlhivSex = data => {
  const { title } = CHARTS.PLHIV_SEX
  const options = {
    legend: { symbolWidth: 40 },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    yAxis: { max: 100, min: 0 },
    plotOptions: { 
      // series: { pointStart: 2015 },
    }
  }

  const fPoints = []
  const rFPoints = []
  const mPoints = []
  const rMPoints = []

  R_2015_2019.forEach((y, i) => {
    const fRow = _.get(data, ['Females', i])
    const [fPoint, rFPoint] = getPlotPoints({ row: fRow, year: y })
    fPoints.push(fPoint)
    rFPoints.push(rFPoint)

    const mRow  = _.get(data, ['Males', i])
    const [mPoint, rMPoint] =  getPlotPoints({ row: mRow, year: y })
    mPoints.push(mPoint)
    rMPoints.push(rMPoint)
  })

  const series = [
    {
      name: 'Men',
      color: maleColor,
      dashStyle: 'solid',
      data: mPoints,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      zIndex: 1
    }, {
      name: 'Men range',
      pointStart: 2015,
      data: rMPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: maleColor,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: 'Women',
      color: femaleColor,
      dashStyle: 'Solid',
      data: fPoints,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      zIndex: 1
    }, {
      name: 'Women range',
      pointStart: 2015,
      data: rFPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: femaleColor,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
  ]
  return _.merge({}, getLine({ title, series, options }))
}

const getPlhivAge = data => {
  const { title } = CHARTS.PLHIV_AGE

  const options = {
    legend: { symbolWidth: 40 },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    yAxis: { max: 100, min: 0 },
    // plotOptions: { series: { pointStart: 2015 } }
  }

  const dataMap = {
    ['15-24']: { points: [], rPoints: [] },
    ['25-34']: { points: [], rPoints: [] },
    ['35-49']: { points: [], rPoints: [] },
    ['50-99']: { points: [], rPoints: [] },
  }

  _.each(dataMap, (obj, age) => {
    const rows = data[age]

    R_2015_2019.forEach((y, i) => {
      const row = rows[i]
      const [point, rPoint] = getPlotPoints({ row, year: y, adjust: true })
      obj.points.push(point)
      obj.rPoints.push(rPoint)
    })
  })

  const series = [
    {
      name: '15 - 24',
      dashStyle: 'ShortDot',
      color: colors[4],
      data: dataMap['15-24'].points,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      zIndex: 1
    },
    {
      name: '15 - 24 range',
      pointStart: 2015,
      data: dataMap['15-24'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[4],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: '25 - 34',
      dashStyle: 'DashDot',
      color: colors[0],
      data: dataMap['25-34'].points,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      zIndex: 1
    },
    {
      name: '25 - 34 range',
      pointStart: 2015,
      data: dataMap['25-34'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[0],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: '35 - 49',
      dashStyle: 'LongDash',
      color: colors[6],
      data: dataMap['35-49'].points,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      zIndex: 1
    },
    {
      name: '35 - 49 range',
      pointStart: 2015,
      data: dataMap['35-49'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[6],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: '50+',
      dashStyle: 'Solid',
      color: colors[7],
      data: dataMap['50-99'].points,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      zIndex: 1
    },
    {
      name: '50+ range',
      pointStart: 2015,
      data: dataMap['50-99'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      fillOpacity: 0.2,
      color: colors[7],
      zIndex: 0,
      marker: { enabled: false }
    },
  ]

  return _.merge({}, getLine({ title, series, options }))
}

const getHivNegative = data => {
  const title = '<span class="hivn-title">HIV-negative</span> tests - first-time testers and repeat testers'

  const dataMap = {
    ['retests']: { points: [] },
    ['firsts']: { points: [] },
  }

  _.each(dataMap, (obj, age) => {
    const rows = data[age]

    R_2015_2019.forEach((y, i) => {
      const row = rows[i]
      const [point] = getPlotPoints({ row, year: y })
      obj.points.push(point)
    })
  })

  const series = [
    {
      name: 'Retest',
      description: TERM_MAP.retest.definition,
      color: colors[6],
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
      data: dataMap.retests.points,
    },
    {
      name: 'First test',
      description: TERM_MAP.firstTest.definition,
      color: colors[10],
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
      data: dataMap.firsts.points,
    },
  ]
  const options = {
    title: { useHTML: true },
    yAxis: { title: { text: 'HIV Negative Tests' } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    plotOptions: { series: { pointStart: 2015 } }
    // tooltip: { valueSuffix: ' thousand' },
  }
  return _.merge({}, getArea({ title, series, options }))
}

const getHivPositive = data => {
  const title = '<span class="hivp-title">HIV-positive</span> tests - new diagnoses and retests'

  const dataMap = {
    ['arts']: { points: [] },
    ['awares']: { points: [] },
    ['firsts']: { points: [] },
  }

  _.each(dataMap, (obj, age) => {
    const rows = data[age]

    R_2015_2019.forEach((y, i) => {
      const row = rows[i]
      const [point] = getPlotPoints({ row, year: y })
      obj.points.push(point)
    })
  })

  const options = {
    title: { useHTML: true },
    yAxis: { title: { text: 'HIV Positive tests' } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
  }
  const series = [
    {
      name: 'Retest - know status on ART',
      description: TERM_MAP.retest.definition,
      color: colors[0],
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
      data: dataMap.arts.points,
      zIndex: 1,
    },
    // {
    //   name: 'Retest - know status on ART range',
    //   data: dataMap.arts.rPoints,
    //   pointStart: 2015,
    //   type: 'arearange',
    //   enableMouseTracking: false,
    //   lineWidth: 0,
    //   linkedTo: ':previous',
    //   color: colors[11],
    //   fillOpacity: 0.2,
    //   zIndex: 0,
    //   marker: { enabled: false }
    // },
    {
      name: 'Retest - know status not on ART',
      description: TERM_MAP.retest.definition,
      color: colors[1],
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
      data: dataMap.awares.points,
      zIndex: 1,
    },
    // {
    //   name: 'Retest - know status not on ART range',
    //   data: dataMap.awares.rPoints,
    //   pointStart: 2015,
    //   type: 'arearange',
    //   enableMouseTracking: false,
    //   lineWidth: 0,
    //   linkedTo: ':previous',
    //   color: colors[17],
    //   fillOpacity: 0.2,
    //   zIndex: 0,
    //   marker: { enabled: false }
    // },
    {
      name: 'New diagnosis',
      description: TERM_MAP.newDiagnosis.definition,
      color: colors[2],
      tooltip: { pointFormatter: uncertaintyTooltipFormatter },
      data: dataMap.firsts.points,
      zIndex: 1,
    },
    // {
    //   name: 'New diagnosis15+) range',
    //   data: dataMap.firsts.rPoints,
    //   pointStart: 2015,
    //   type: 'arearange',
    //   enableMouseTracking: false,
    //   lineWidth: 0,
    //   linkedTo: ':previous',
    //   color: colors[5],
    //   fillOpacity: 0.2,
    //   zIndex: 0,
    //   marker: { enabled: false }
    // },
  ]
  return _.merge({}, getArea({ title, series, options }))
}

const getPrevalence = (data, shinyCountry) => {
  let { title, nonShinyTitle } = CHARTS.PREVALENCE
  title = shinyCountry ? title : nonShinyTitle

  const options = {
    plotOptions: { series: {
      marker: { radius: 3 },
      softThreshold: true
    } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    yAxis: { min: 0 },
  }

  const prevalenceData = []
  const rPrevalenceData = []
  const positivityData = [] // for shiny
  const rPositivityData = [] // for shiny
  const dYieldData = [] // for shiny
  const rDYieldData = [] // for shiny
  const adjPrevData = []
  R_2015_2019.forEach((y, i) => {
    const prevalenceRow = _.get(data, ['prevalence', i])
    const [prevalencePoint, rPrevalencePoint] = getPlotPoints({ row: prevalenceRow, year: y, decimals: 1 })
    prevalenceData.push(prevalencePoint)
    rPrevalenceData.push(rPrevalencePoint)

    const populationValue = _.get(data, ['population', i, [FIELD_MAP.VALUE]])
    const onArtValue = _.get(data, ['onArt', i, [FIELD_MAP.VALUE]])
    const plhivValue = _.get(data, ['plhiv', i, [FIELD_MAP.VALUE]])

    let adjPrevValue
    if (populationValue && onArtValue && plhivValue) {
      adjPrevValue = (
        (plhivValue - onArtValue) * 100 /
        (populationValue - onArtValue)
      )
    }
    adjPrevData.push({ x: Number(y), y: adjPrevValue, decimals: 1 })

    if (shinyCountry) {
      const positivityRow = _.get(data, ['positivity', i])
      const dYieldRow = _.get(data, ['dYield', i])
      const [positivityPoint, rPositivityPoint] = getPlotPoints({ row: positivityRow, year: y, adjust: true, decimals: 1 })
      positivityData.push(positivityPoint)
      rPositivityData.push(rPositivityPoint)
      const [dYieldPoint, rDYieldPoint] = getPlotPoints({ row: dYieldRow, year: y, adjust: true, decimals: 1 })
      dYieldData.push(dYieldPoint)
      rDYieldData.push(rDYieldPoint)
    }
  })

  const series = [
    {
      name: 'HIV prevalence',
      description: TERM_MAP.hivPrevalence.definition,
      zIndex: 1,
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      color: colors[12],
      dashStyle: 'ShortDot',
      marker: { radius: 1 },
      lineType: 'line',
      data: prevalenceData,
    }, {
      name: 'Prevalence range',
      pointStart: 2015,
      data: rPrevalenceData,
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[12],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: 'Treatment adjusted prevalence',
      description: TERM_MAP.treatmentAdjustedPrevalence.definition,
      zIndex: 1,
      color: colors[3],
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      data: adjPrevData
    },
  ]

  if (shinyCountry) {
    const shinyAdditions = [{
      name: 'Positivity',
      description: TERM_MAP.positivity.definition,
      zIndex: 1,
      color: colors[4],
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      data: positivityData
    }, {
      name: 'Positivity range',
      pointStart: 2015,
      data: rPositivityData,
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[4],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    }, {
      name: 'Diagnostic yield',
      description: TERM_MAP.diagnosticYield.definition,
      zIndex: 1,
      color: colors[8],
      tooltip: { pointFormatter: percentUncertaintyTooltipFormatter },
      data: dYieldData
    }, {
      name: 'Diagnostic yield range',
      pointStart: 2015,
      data: rDYieldData,
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[8],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    }]
    series.push(...shinyAdditions)
  }

  return _.merge({}, getLine({ series, options, title, spline: false }))
}


function getColumnPoints(numData, posData) {
  
  const tSource = posData[FIELD_MAP.SOURCE_DATABASE]
  const numPoint = numData.noData ? null : {
    y: numData[FIELD_MAP.VALUE],
    source: SOURCE_DISPLAY_MAP[tSource] || tSource,
  }

  const source = posData[FIELD_MAP.SOURCE_DATABASE]
  const posPoint = !(numPoint && numPoint.y) ? null : {
    source: SOURCE_DISPLAY_MAP[source] || source,
    year: posData[FIELD_MAP.YEAR],
    y: adjustPercentage({ row: posData })
  }

  return [numPoint, posPoint]
}

const getAdults = data => {
  const { title, indicatorIds, sources } = CHARTS.ADULTS

  const { 
    total, men, women,
    pTotal, pMen, pWomen, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)
  
  // console.log('total: ',total, 'men: ',men, 'women: ',women, 'pTotal: ',pTotal, 'pMen: ',pMen, 'pWomen: ',pWomen, 'missingIndicators: ',missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }
  
  const [ wNumData, wPosData ] = getColumnPoints(women, pWomen)
  const [ mNumData, mPosData ] = getColumnPoints(men, pMen)

  if (
    men[FIELD_MAP.SOURCE_DATABASE] !== pMen[FIELD_MAP.SOURCE_DATABASE] ||
    women[FIELD_MAP.SOURCE_DATABASE] !== pWomen[FIELD_MAP.SOURCE_DATABASE]
  ) {
    console.error('**SOURCE MISMATCH**')
  }

  const series = [
    {
      name: barChartsTestsName,
      // color: barChartColorDark,
      tooltip: {
        // pointFormatter: sourceTooltipFormatter
      },
      data: [wNumData, mNumData]
    },
    {
      name: barChartsPositivityName,
      // color: barChartAccent,
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [wPosData, mPosData]
    }
  ]
  const categories = ['Women (15+)', 'Men (15+)']

  const options = {
    subtitle: { 
      useHTML: true,
      text: getSubtitle(total, pTotal)
    }
  }
  return _.merge({}, getColumnScat({ title, series, options, categories }))
}

const getCommunity = data => {
  const { title, indicatorIds, sources } = CHARTS.COMMUNITY

  const {
    total, mobile, VCT, other,
    pTotal, pMobile, pVCT, pOther, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  // console.log('total: ', total, 'mobile: ', mobile, 'VCT: ', VCT, 'other: ', other, 'pTotal: ', pTotal, 'pMobile: ', pMobile, 'pVCT: ', pVCT, 'pOther: ', pOther, 'missingIndicators: ', missingIndicators)
  
  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const [ mobileNumData, mobilePosData ] = getColumnPoints(mobile, pMobile)
  const [ vctNumData, vctPosData ] = getColumnPoints(VCT, pVCT)
  const [ otherNumData, otherPosData ] = getColumnPoints(other, pOther)

  if (
    mobile[FIELD_MAP.SOURCE_DATABASE] !== pMobile[FIELD_MAP.SOURCE_DATABASE] ||
    VCT[FIELD_MAP.SOURCE_DATABASE] !== pVCT[FIELD_MAP.SOURCE_DATABASE] || 
    other[FIELD_MAP.SOURCE_DATABASE] !== pOther[FIELD_MAP.SOURCE_DATABASE]
  ) {
    console.error('**SOURCE MISMATCH**')
  }
  
  const series = [
    {
      name: barChartsTestsName,
      // color: barChartColorDark,
      data: [mobileNumData, vctNumData, otherNumData]
    },
    {
      name: barChartsPositivityName,
      // color: barChartAccent,
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [mobilePosData, vctPosData, otherPosData]
    }
  ]

  const options = {
    subtitle: {
      useHTML: true,
      text: getSubtitle(total, pTotal)
    }
  }
  const categories = ['Mobile Testing', 'VCT', 'Other']
  return _.merge({}, getColumnScat({ title, series, options, categories }))
}

const getFacility = data => {
  const { title, indicatorIds, sources } = CHARTS.FACILITY

  const {
    total, PITC, ANC, VCT, family, other,
    pTotal, pPITC, pANC, pVCT, pFamily, pOther, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  // console.log('total: ', total, 'PITC: ', PITC, 'ANC: ', ANC, 'VCT: ', VCT, 'family: ', family, 'other: ', other,
    // 'pTotal: ', pTotal, 'pPITC: ', pPITC, 'pANC: ', pANC, 'pVCT: ', pVCT, 'pFamily: ', pFamily, 'pOther: ', pOther, 'missingIndicators: ', missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const [ pitcNumData, pitcPosData ] = getColumnPoints(PITC, pPITC)
  const [ ancNumData, ancPosData ] = getColumnPoints(ANC, pANC)
  const [ vctNumData, vctPosData ] = getColumnPoints(VCT, pVCT)
  const [ familyNumData, familyPosData ] = getColumnPoints(family, pFamily)
  const [ otherNumData, otherPosData ] = getColumnPoints(other, pOther)

  if (
    PITC[FIELD_MAP.SOURCE_DATABASE] !== pPITC[FIELD_MAP.SOURCE_DATABASE] ||
    ANC[FIELD_MAP.SOURCE_DATABASE] !== pANC[FIELD_MAP.SOURCE_DATABASE] ||
    VCT[FIELD_MAP.SOURCE_DATABASE] !== pVCT[FIELD_MAP.SOURCE_DATABASE] ||
    family[FIELD_MAP.SOURCE_DATABASE] !== pFamily[FIELD_MAP.SOURCE_DATABASE] ||
    other[FIELD_MAP.SOURCE_DATABASE] !== pOther[FIELD_MAP.SOURCE_DATABASE]
  ) {
    console.error('**SOURCE MISMATCH**')
  }
  
  const series = [
    {
      name: barChartsTestsName,
      // color: barChartColorDark,
      tooltip: {
        // todo: delete if can be handled below (or in legend hover)
        // pointFormat:`<span style="color:{point.color}">●</span>
        //   {series.name}: <b>{point.y}</b><br/>
        //   Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
        //   Source: UNAIDS`,
      },
      data: [
        pitcNumData,
        ancNumData,
        vctNumData,
        familyNumData,
        otherNumData,
      ],
    },
    {
      name: barChartsPositivityName,
      // color: barChartAccent,
      // tooltip: {
      //   pointFormat: `<span style="color:{point.color}">●</span>
      //     {series.name}: <b>{point.y}</b><br/>
      //     {point.tooltipAddition}`
      // },
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [
        pitcPosData,
        ancPosData,
        vctPosData,
        familyPosData,
        otherPosData,
        // { y: 11, tooltipAddition: 'Description: something you should know about Other' }
      ],
    }
  ]

  const options = {
    subtitle: {
      useHTML: true,
      text: getSubtitle(total, pTotal)
    }
  }
  const categories = ['PITC', 'ANC', 'VCT', 'Family Planning Clinic', 'Other']
  // const options = { xAxis: { categories: ['Community', 'Facility']} }
  return _.merge({}, getColumnScat({ title, options, categories, series }))
}

const getIndex = data => {

  const { title, indicatorIds, sources } = CHARTS.INDEX

  const {
    total, community, facility,
    pTotal, pCommunity, pFacility, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  // console.log('total: ', total, 'community', community, 'facility', facility,
  //   'ptotal: ', pTotal, 'pcommunity: ', pCommunity, 'pfacility: ', pFacility,
  //  'missingIndicators: ', missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  if (
    community[FIELD_MAP.SOURCE_DATABASE] !== pCommunity[FIELD_MAP.SOURCE_DATABASE] ||
    facility[FIELD_MAP.SOURCE_DATABASE] !== pFacility[FIELD_MAP.SOURCE_DATABASE]
  ) {
    console.error('**SOURCE MISMATCH**')
  }

  const [ communityNumData, communityPosData ] = getColumnPoints(community, pCommunity)
  const [ facilityNumData, facilityPosData ] = getColumnPoints(facility, pFacility)
  
  const series = [
    {
      name: barChartsTestsName,
      // color: barChartColorDark,
      data: [communityNumData, facilityNumData]
      // dataLabels,
    },
    {
      name: barChartsPositivityName,
      // color: barChartAccent,
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [communityPosData, facilityPosData]
    }
  ]
  const options = {
    subtitle: {
      useHTML: true,
      text: getSubtitle(total, pTotal)
    }
  }
  const categories = ['Community', 'Facility']
  return _.merge({}, getColumnScat({ title, options, categories, series }))
}

const getForecast = data => {
  const { title, indicatorIds, indicatorYears, sources } = CHARTS.FORECAST

  const {
    distributed, demand, need, missingIndicatorMap
  } = extractPrioritizedRangeData(
    { data, indicatorIds, sourceCount: sources.length, indicatorRangeMap: indicatorYears }
  )
  const missingIndicators = Object.keys(missingIndicatorMap)

  // console.log('distributed: ', distributed, 'demand: ', demand, 'need: ', need, 'missingIndicators: ', missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  // todo: remove compact
  const distributedNumData = distributed.map(d => ({
    x: Number(d.year),
    y: d.value,
    source: d[FIELD_MAP.SOURCE_DATABASE]
  }))

  const demandNumData = demand.map(d => ({
    x: Number(d.year),
    y: d.value,
  }))

  const needNumData = need.map(d => ({
    x: Number(d.year),
    y: d.value,
    source: d[FIELD_MAP.SOURCE_DATABASE]
  }))


  const options = {
    subtitle: { text: 'WHO model estimates, 2020' },
    // plotOptions: { series: { pointStart: 2019 } }
  }
  const series = [
    {
      name: 'HIVSTs distributed',
      data: distributedNumData,
      tooltip: {
        pointFormat: sourceTooltipFormat // TODO: use formatter?
      },
    },
    {
      name: 'HIVST forecast demand',
      data: demandNumData,
    },
    {
      name: 'HIVST forecast need',
      type: 'line',
      data: needNumData,
      tooltip: {
        // pointFormat: sourceTooltipFormat // TODO: use formatter?
      },
    }
  ]

  return _.merge({}, getColumnLine({ title, series, options }))
}

const getKpTable = data => {
  const { title, indicatorIds, sources } = CHARTS.KP_TABLE
  
  const {
    prevMsm, prevPwid, prevPris, prevSw, prevTrans,
    awareMsm, awarePwid, awarePris, awareSw, awareTrans,
    yearMsm, yearPwid, yearPris, yearSw, yearTrans,
    missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  // console.log(
  //   'KP DATA | ',
  //   'prevMsm: ', prevMsm,
  //   'prevPwid: ', prevPwid,
  //   'prevPris: ', prevPris,
  //   'prevSw: ', prevSw,
  //   'prevTrans: ', prevTrans,
  //   'awareMsm: ', awareMsm,
  //   'awarePwid: ', awarePwid,
  //   'awarePris: ', awarePris,
  //   'awareSw: ', awareSw,
  //   'awareTrans: ', awareTrans,
  //   'yearMsm: ', yearMsm,
  //   'yearPwid: ', yearPwid,
  //   'yearPris: ', yearPris,
  //   'yearSw: ', yearSw,
  //   'yearTrans: ', yearTrans,
  // )

  const sw = {
    prev: prevSw, aware: awareSw, year: yearSw, 
  }
  const msm = {
    prev: prevMsm, aware: awareMsm, year: yearMsm, 
  }
  const pwid = {
    prev: prevPwid, aware: awarePwid, year: yearPwid, 
  }
  const trans = {
    prev: prevTrans, aware: awareTrans, year: yearTrans, 
  }
  const pris = {
    prev: prevPris, aware: awarePris, year: yearPris, 
  }

  // const inds = ['']
  // ['sw', 'msm', 'pwid', 'trans', 'pris'].map(dem => {

  // })

  const config = {
    title,
    data: {
      sw,
      msm,
      pwid,
      trans,
      pris,
    }
  }

  return config
}

const getPolicyTable = data => {
  const { title } = CHARTS.POLICY_TABLE
  
  const {
    age,
    provider,
    community,
    lay,
    hivst,
    assisted,
    social,
    compliance,
    verification,
  } = data

  const config = {
    title,
    data: [{ 
        rowName: 'Age of consent for HIV testing',
        value: _.get(age, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Provider-initiated testing',
        value: _.get(provider, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Community-based testing',
        value: _.get(community, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Lay provider testing',
        value: _.get(lay, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Self-testing',
        value: _.get(hivst, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Provider-assisted referral/index testing',
        value: _.get(assisted, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Social network-based testing',
        value: _.get(social, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Compliance with WHO testing strategy',
        value: _.get(compliance, [FIELD_MAP.VALUE_COMMENT])
      },{ 
        rowName: 'Verification testing before ART',
        value: _.get(verification, [FIELD_MAP.VALUE_COMMENT])
      },]
  }

  return config
}

const getGroupsTable = (data, shinyCountry) => {
  const { title, indicatorIds, indicatorDemographics, indicatorDemographicsNoShiny, sourceCountMap } = CHARTS.GROUPS_TABLE

  const indicatorRangeMap = shinyCountry ?
    indicatorDemographics : indicatorDemographicsNoShiny

  // const indicatorIds = ['year']

  const allData = extractPrioritizedRangeData({
    data,
    indicatorIds,
    sourceCountMap,
    indicatorRangeMap,
    mappedData: true,
    rangedField: 'demo'
  })

  const missingIndicators = Object.keys(allData.missingIndicatorMap)

  const undiagnosed = _.mapValues(allData.aware, (v, dem) => {
    let { 
      [FIELD_MAP.VALUE]: awareVal,
      [FIELD_MAP.SOURCE_DATABASE]: awareSource
    } = _.get(allData, ['aware', dem], {})

    let { 
      [FIELD_MAP.VALUE]: plhivVal,
      [FIELD_MAP.SOURCE_DATABASE]: plhivSource
    } = _.get(allData, ['plhiv', dem], {})

    if (!awareVal || !plhivVal) {
      return { value: undefined }
    }

    if (awareSource === SOURCE_DB_MAP.SPEC20) {
      awareVal/=100
    }
    
    return { value: ((1-awareVal) * plhivVal), source: 'calculated' }
  })
  allData.undiagnosed = undiagnosed
  
  // console.log('distributed: ', distributed, 'demand: ', demand, 'need: ', need, 'missingIndicators: ', missingIndicators)
  // console.log(
    // '\nPLHIV || ', allData.plhiv,
    // '\nAWARE || ', allData.aware,
    // '\nPREV || ', allData.prev,
    // '\nNEWLY || ', allData.newly,
    // '\nYEAR || ', allData.year,
    // '\nEVER || ', allData.ever,
    // )

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const config = {
    title,
    includedDemographics: indicatorRangeMap.ALL,
    dataMap: {},
  }

  _.each(config.includedDemographics, dem => {
    const rowData = { demographic: dem }
    config.dataMap[dem] = rowData
    
    _.each([...indicatorIds, 'undiagnosed'], ind => {
      const indDemoData = _.get(allData, [ind, dem], undefined)
      if (!indDemoData) {
        console.log('No group table data for ', ind, ' for ', dem)
        return
      }
      let {
        [FIELD_MAP.YEAR]: year,
        [FIELD_MAP.VALUE]: value,
        [FIELD_MAP.VALUE_LOWER]: valueLower,
        [FIELD_MAP.VALUE_UPPER]: valueUpper,
        [FIELD_MAP.SOURCE_DATABASE]: source, 
        noData
      } = indDemoData
      
      const vMap = { value, valueLower, valueUpper }
      rowData[ind] = {}
      _.each(vMap, (v, vId) => {
        if (_.isNumber(v)) {
          if ((ind === 'aware' || ind === 'prev')
            && source === SOURCE_DB_MAP.SPEC20) {
            v = v/100
          }
          const percentages = ['aware', 'prev', 'ever']
          if (percentages.includes(ind)) {
            v = displayPercent({ v, adjust: true, decimals: ind === 'prev' })
          } else {
            // NOTE: ** conditional source tweak **
            const unrounded = (ind === 'year' && source !== SOURCE_DB_MAP.S90)
            v = displayNumber({ v, unrounded })
          }
          vMap[vId] = v
        }
      })

      
      rowData[ind] = {
        source, year, noData, ...vMap
      }
    })
  })
  
  return config
}

export {
  getConfig,
  adjustPercentage,
  displayPercent,
  displayNumber,
}
