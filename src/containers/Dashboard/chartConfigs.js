import colors, { femaleColor, maleColor, buddhaGold, charm, copper, botticelli, stormGray, casablanca, steelBlue, midGray, gunSmoke, jungleGreen, jungleMist, snowDrift, nandor, putty, froly } from "./colors"
import _ from 'lodash'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import { CHARTS, FIELD_MAP, AGE_MAP, SOURCE_DB_MAP, SOURCE_DISPLAY_MAP, ALL_CHARTS, CSV_FIELDS } from "../../constants/charts";
import { TERM_MAP } from "../../constants/glossary";

// TODO: move
const WITH_CUSTOM_HEADER_CHART_HEIGHT = 300 // keep in sync with styles.scss with-custom-header height
// reduces chart top spacing (first number) by ~15 to give custom-header charts proper distance from header
const WITH_CUSTOM_HEADER_CHART_SPACING = [15, 30, 25, 25] // keep in sync with baseStyle spacing

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
const spectrumSource = 'Spectrum model estimates (UNAIDS/WHO, 2020)'
const shinySource = 'Spectrum/Shiny90 model estimates (UNAIDS/WHO, 2020)'
const calculatedDb = '(calculated)'

function adjustPercentage({ row, toDisplay=false, decimals=0, returnRow=false }) {
  
  if (!row) {
    console.warn('No % to adjust')
    return null
  }
  
  let {
    [FIELD_MAP.VALUE]: v,
    // [FIELD_MAP.INDICATOR]: indicator,
    // [FIELD_MAP.SOURCE_DATABASE]: source,
    [FIELD_MAP.INDICATOR_DESCRIPTION]: description,
  } = row

  if (!_.isNumber(v)) {
    console.warn('No % to adjust')
    return null
  }

  // NOTE: ** conditional source tweak **
  const adjust = (description === 'PEPFAR Calculated Indicator') && (v <= 1)
  if (adjust) {
    v *= 100
  }

  // for export we want the whole row (cloned for safety)
  if (returnRow) {
    if (!adjust) {
      return row
    } else {
      return _.extend({}, row, { [FIELD_MAP.VALUE]: v })
    }
  }

  if (toDisplay) {
    return displayPercent({ v, decimals })
  }
  return v
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
function displayNumber({ v, unrounded=false }) {
  if (!_.isNumber(v)) {
    console.warn('NaN fed to displayNumber: ', v)
    return null
  }

  if (v > 1000000000) {
    return _.round(v/1000000000, 1).toString() + ' billion'
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

function sourceTooltipFormatter () {
const mismatchedData = !this.mismatched ? '' : `
  Year: <b>${this.year}</b><br/>
  Source: <b>${this.source}</b>
`

return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayNumber({ v: this.y, unrounded: true })}</b><br/>
    ${mismatchedData}
    `
}
function percentSourceTooltipFormatter () {
  const decimals = this.decimals || 1 // intended for column charts (positivity gets 1)
  
  return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayPercent({ v: this.y, decimals })}</b><br/>
    Year: <b>${this.year}</b><br/>
    ${!this.source ? '' : `Source: <b>${this.source}</b>`}
  `
}
function getUncertaintyTooltipFormatter (shinyCountry) {
  
  const source = shinyCountry ? shinySource : spectrumSource

  return function() {
    const uncertaintyLine = (!this.l || !this.u) ? '' : `Uncertainty range: <b>${displayNumber({ v: this.l })} - ${displayNumber({ v: this.u })}</b><br />`
    return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayNumber({ v: this.y })}</b><br />
    ${uncertaintyLine}
    Source: <b>${source}</b>
    `
  }
}
function getPercentUncertaintyTooltipFormatter (shinyCountry) {

  const source = shinyCountry ? shinySource : spectrumSource
  
  return function() {

    const decimals = this.decimals || 0
    const lVal = displayPercent({ v: this.l, decimals })
    const uVal = displayPercent({ v: this.u, decimals })
    const uncertaintyLine = (!lVal || !uVal) ? '' : `Uncertainty range: <b>${lVal} - ${uVal}</b><br />`
    return `
    <span style="color:${this.color}">●</span>
    ${this.series.name}: <b>${displayPercent({ v: this.y, decimals })}</b><br />
    ${uncertaintyLine}
    Source: <b>${source}</b>
    `
  }
}

function getLineChartSubtitle(shinyCountry) {
  const tooltip = 'Source: ' + (shinyCountry ? shinySource : spectrumSource)
  const subtitle = `<span title="${tooltip}">Modelled estimates</span>`
  return ({ useHTML: true, text: subtitle })
}

function getColumnChartCustomHeader(totalRow, averageRow, title) {
  const {
    [FIELD_MAP.SOURCE_DATABASE]: totalSource,
    [FIELD_MAP.YEAR]: totalYear,
  } = totalRow
  // const tooltip = `Source: ${SOURCE_DISPLAY_MAP[source]||source}\nYear: ${year}`

  const {
    [FIELD_MAP.SOURCE_DATABASE]: averageSource,
    [FIELD_MAP.YEAR]: averageYear,
  } = averageRow
  // const pTooltip = `Source: ${SOURCE_DISPLAY_MAP[pSource]||pSource}\nYear: ${pYear}`

  // const formattedTotal = displayNumber({ v: total.value, unrounded: true })
  // const adjustedPTotal = adjustPercentage({ row: pTotal, toDisplay: true, decimals: 1 })
  
  // const subtitle = `<div><span title="${tooltip}"><b>Total tests</b>: ${formattedTotal||'N/A'}</span> 
  // <span title="${pTooltip}"><b>Average positivity</b>: ${adjustedPTotal||'N/A'}</span><br /><span>Programme data</span></div>`
  return ({
    columnChartHeader: true,
    title,
    subtitle: {
      totalTests: displayNumber({ v: totalRow.value, unrounded: true }),
      totalSource: SOURCE_DISPLAY_MAP[totalSource] || totalSource,
      totalYear,
      averagePositivity: adjustPercentage({ row: averageRow, toDisplay: true, decimals: 1 }),
      averageSource: SOURCE_DISPLAY_MAP[averageSource] || averageSource,
      averageYear,
    }
   })
}

function getPlotPoints({ row, year, adjust=false, decimals=0, forExport=false }) {
  const x = Number(year || _.get(row, [FIELD_MAP.YEAR]))
  if (!row || !row.value) {
    return [null, null]
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

  if (forExport) {
    point[FIELD_MAP.VALUE] = y
    point[FIELD_MAP.VALUE_LOWER] = l
    point[FIELD_MAP.VALUE_UPPER] = u
    CSV_FIELDS.forEach(({ fieldId }) => {
      if (_.isUndefined(point[fieldId])) {
        point[fieldId] = row[fieldId] || ''
      }
    })
  }
  
  // https://api.highcharts.com/highcharts/series.arearange.data
  const rPoint = [x, l, u]
  return [point, rPoint]
}

function isDataMapEmpty (dataMap) {
  return _.every(dataMap, (obj, ind) => {
    return obj.points.length <= 1
  })
}

// __________________________________________________________________

const getConfig = (chartId, chartData, shinyCountry=false, forExport=false) => {
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
    const config = getter(data, shinyCountry, forExport)
    const exp = forExport ? ' export' : ''
    console.log(chartId, exp, ' config: ', config)
    return config
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
        result[ind] = {
          value: defaultValue,
          noData: true,
          [FIELD_MAP.SOURCE_DATABASE]: 'N/A',
          [FIELD_MAP.YEAR]: 'N/A',
        }
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

      for (let i = 1; i <= (count+2); i++) { // go to count+2 in case sourceCountMap wasn't updated
        // eg _.get({ ind1: [ 3, null ], ind2: [1, 5] }, ['ind'+2, 1]) => 5
        const selector = mappedData ? range : ri
        const indicatorResult = _.get(data, [ind+i, selector], null)
        if (indicatorResult && indicatorResult[FIELD_MAP.VALUE]) {

          if (i > count) {
            console.error('!!! Update sourceCountMap to reflect added sources to prevent data from being dropped !!!')
          }
          
          return indicatorResult
        } else if (i === count) {
          _.setWith(result.missingIndicatorMap, [ind, range], true, Object)
          return { value: null, [rangedField]: range, noData: true, [FIELD_MAP.SOURCE_DATABASE]: 'N/A', [FIELD_MAP.YEAR]: (rangedField === 'year' ? range : 'N/A') }
        }
      }

    })

  })

  return result
}

const getP95 = (data, shinyCountry=false, forExport=false) => {
  const indicatorNames = ['status', 'art', 'suppression']
  if (forExport) {
    return indicatorNames.map(ind => _.get(data, ind))
  }

  let source
  const years = []
  const config = indicatorNames.map(ind => {
    const indData = _.get(data, [ind], {})
    const {
      [FIELD_MAP.SOURCE_DATABASE]: indSource,
      [FIELD_MAP.VALUE]: value,
      [FIELD_MAP.YEAR]: indYear,
    } = indData
    // source/year should be same for all. just make sure to get one (in case one is missing)
    source = source || indSource
    console.log('indsrc: ', indSource)
    console.log('indyr: ', indYear)
    years.push(indYear)

    return value / 100
  })

  config.source = SOURCE_DISPLAY_MAP[source] || source
  config.year = _.chain(years).compact().uniq().sort().value().join(', ')

  return config
}

const getPlhivDiagnosis = (data, shinyCountry=false, forExport=false) => {
  const { title, yearRange } = CHARTS.PLHIV_DIAGNOSIS

  // colors: 17 11 5

  const options = {
    // yAxis: { labels: { format: '{value}%' } },
    subtitle: getLineChartSubtitle(shinyCountry),
    // tooltip: { valueSuffix: ' million' },
    xAxis: { ceiling: Number(_.last(yearRange)), floor: Number(yearRange[0]) },
    yAxis: { title: { text: 'Adults 15+' } },
    // plotOptions: { series: { pointStart: 2015 } }
    // tooltip: { pointFormat: '{series.name}: <b>{point.y:.0f} million</b>' },
    // yAxis: { max: 58*2 },
  }

  const undiagnosedData = []
  const notArtData = []
  const onArtData = []
  // for export
  const knowData = []
  const plhivData = []
  
  yearRange.forEach((y, i) => {
    const onArtRow = _.get(data, ['onArt', i])
    const [onArtPoint] = getPlotPoints({ row: onArtRow, year: y, forExport })
    const plhivRow = _.get(data, ['plhiv', i])
    const [plhivPoint] = getPlotPoints({ row: plhivRow, year: y, forExport })
    const knowRow = _.get(data, ['know', i])
    const [knowPoint] = getPlotPoints({ row: knowRow, year: y, forExport })

    let undiagnosedPoint, notArtPoint
    // NOTE ** calculated indicator **
    if (plhivPoint && plhivPoint.y) {
      if (knowPoint && knowPoint.y) {
        // cannibalize knowPoint for its year, source etc
        const undiagnosedValue = (plhivPoint.y - knowPoint.y)
        undiagnosedPoint = _.extend({}, knowPoint, {
          [FIELD_MAP.VALUE_UPPER]: null,
          u: null,
          [FIELD_MAP.VALUE_LOWER]: null,
          l: null,
          [FIELD_MAP.VALUE]: undiagnosedValue,
          [FIELD_MAP.INDICATOR]: 'Undiagnosed PLHIV',
          y: undiagnosedValue,
          [FIELD_MAP.SOURCE_DATABASE]: calculatedDb,
          [FIELD_MAP.NOTES]: `based on ${plhivPoint[FIELD_MAP.INDICATOR]} and ${knowPoint[FIELD_MAP.INDICATOR]} indicator values`,
        });

        if (onArtPoint && onArtPoint.y) {
          // cannibalize plhivPoint for its year, source etc
          const notArtValue = (knowPoint.y - onArtPoint.y)
          notArtPoint = _.extend({}, plhivPoint, {
            [FIELD_MAP.VALUE_UPPER]: null,
            u: null,
            [FIELD_MAP.VALUE_LOWER]: null,
            l: null,
            [FIELD_MAP.VALUE]: notArtValue,
            [FIELD_MAP.INDICATOR]: 'PLHIV know status not on ART',
            y: notArtValue,
            [FIELD_MAP.SOURCE_DATABASE]: calculatedDb,
            [FIELD_MAP.NOTES]: `based on ${knowPoint[FIELD_MAP.INDICATOR]} and ${onArtPoint[FIELD_MAP.INDICATOR]} indicator values`,
          });
        }
      }
    }
    
    if ((onArtPoint && notArtPoint && undiagnosedPoint) || forExport) {
      onArtData.push(onArtPoint)
      notArtData.push(notArtPoint)
      undiagnosedData.push(undiagnosedPoint)
      // for export
      knowData.push(knowPoint)
      plhivData.push(plhivPoint)
    }
  })

  if (forExport) {
    return [...onArtData, ...notArtData, ...undiagnosedData, ...knowData, ...plhivData]
  }

  // just check one series, since points only get added when they exist for all indicators
  if (onArtData.length <= 1) {
    console.warn(title + ' has all empty series.')
    return null
  }
  
  const series = [
    {
      name: 'Undiagnosed PLHIV',
      description: TERM_MAP.undiagnosedPlhiv.definition,
      color: copper,
      data: undiagnosedData,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
    },
    {
      name: 'PLHIV know status not on ART',
      description: TERM_MAP.plhivWhoKnowStatusNotOnArt.definition,
      color: botticelli,
      data: notArtData,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
    },
    {
      name: 'PLHIV know status on ART',
      description: TERM_MAP.plhivKnowStatusOnArt.definition,
      color: stormGray,
      data: onArtData,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
    },
  ]
  return _.merge({}, getArea({ title, series, options }))
}

const getPlhivSex = (data, shinyCountry=false, forExport=false) => {
  const { title, yearRange } = CHARTS.PLHIV_SEX
  const options = {
    legend: { symbolWidth: 40 },
    subtitle: getLineChartSubtitle(shinyCountry),
    xAxis: { ceiling: Number(_.last(yearRange)), floor: Number(yearRange[0]) },
    yAxis: { max: 100, min: 0 },
    plotOptions: { 
      // series: { pointStart: 2015 },
    }
  }

  const fPoints = []
  const rFPoints = []
  const mPoints = []
  const rMPoints = []

  yearRange.forEach((y, i) => {
    const fRow = _.get(data, ['Females', i])
    const [fPoint, rFPoint] = getPlotPoints({ row: fRow, year: y, forExport })
    if (fPoint) {
      fPoints.push(fPoint)
      rFPoints.push(rFPoint)
    }

    const mRow  = _.get(data, ['Males', i])
    const [mPoint, rMPoint] =  getPlotPoints({ row: mRow, year: y, forExport })
    if (mPoint) {
      mPoints.push(mPoint)
      rMPoints.push(rMPoint)
    }
  })

  if (forExport) {
    return [...fPoints, ...mPoints]
  }


  if (mPoints.length <= 1 && fPoints.length <= 1) {
    console.warn(title + ' has all empty series.')
    return null
  }
  const series = [
    {
      name: 'Men',
      color: maleColor,
      dashStyle: 'solid',
      data: mPoints,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      zIndex: 1
    }, {
      name: 'Men range',
      // pointStart: 2015,
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
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      zIndex: 1
    }, {
      name: 'Women range',
      // pointStart: 2015,
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

const getPlhivAge = (data, shinyCountry=false, forExport=false) => {
  const { title, yearRange } = CHARTS.PLHIV_AGE

  const options = {
    legend: { symbolWidth: 40 },
    subtitle: getLineChartSubtitle(shinyCountry),
    xAxis: { ceiling: Number(_.last(yearRange)), floor: Number(yearRange[0]) },
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

    yearRange.forEach((y, i) => {
      const row = rows[i]
      const [point, rPoint] = getPlotPoints({ row, year: y, adjust: true, forExport })
      if (point) {
        obj.points.push(point)
        obj.rPoints.push(rPoint)
      }
    })
  })

  if (forExport) {
    return _.flatMap(dataMap, 'points')
  }


  if (isDataMapEmpty(dataMap)) {
    console.warn(title + ' has all empty series.')
    return null
  }

  const series = [
    {
      name: '15 - 24',
      dashStyle: 'ShortDot',
      color: jungleGreen,
      data: dataMap['15-24'].points,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      zIndex: 1
    },
    {
      name: '15 - 24 range',
      // pointStart: 2015,
      data: dataMap['15-24'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: jungleGreen,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: '25 - 34',
      dashStyle: 'DashDot',
      color: stormGray,
      data: dataMap['25-34'].points,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      zIndex: 1
    },
    {
      name: '25 - 34 range',
      // pointStart: 2015,
      data: dataMap['25-34'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: stormGray,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: '35 - 49',
      dashStyle: 'LongDash',
      color: casablanca, // steelBlue,
      data: dataMap['35-49'].points,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      zIndex: 1
    },
    {
      name: '35 - 49 range',
      // pointStart: 2015,
      data: dataMap['35-49'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      color: casablanca, // steelBlue,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: '50+',
      dashStyle: 'Solid',
      color: charm,
      data: dataMap['50-99'].points,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      zIndex: 1
    },
    {
      name: '50+ range',
      // pointStart: 2015,
      data: dataMap['50-99'].rPoints,
      type: 'arearange',
      enableMouseTracking: false,
      lineWidth: 0,
      linkedTo: ':previous',
      fillOpacity: 0.2,
      color: charm,
      zIndex: 0,
      marker: { enabled: false }
    },
  ]

  return _.merge({}, getLine({ title, series, options }))
}

const getHivNegative = (data, shinyCountry=false, forExport=false) => {
  const { yearRange } = CHARTS.HIV_NEGATIVE
  const title = '<span class="hivn-title">HIV-negative</span> tests - first-time testers and repeat testers'

  const dataMap = {
    ['retests']: { points: [] },
    ['firsts']: { points: [] },
  }

  _.each(dataMap, (obj, ind) => {
    const rows = data[ind]

    yearRange.forEach((y, i) => {
      const row = rows[i]
      const [point] = getPlotPoints({ row, year: y, forExport })
      if (point) {
        obj.points.push(point)
      }
    })
  })

  if (forExport) {
    return _.flatMap(dataMap, 'points')
  }

  if (isDataMapEmpty(dataMap)) {
    console.warn(title + ' has all empty series.')
    return null
  }
  
  const series = [
    {
      name: 'Retest',
      description: TERM_MAP.retest.definition,
      color: nandor,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
      data: dataMap.retests.points,
    },
    {
      name: 'First test',
      description: TERM_MAP.firstTest.definition,
      color: steelBlue,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
      data: dataMap.firsts.points,
    },
  ]
  const options = {
    title: { useHTML: true },
    xAxis: { ceiling: Number(_.last(yearRange)), floor: Number(yearRange[0]) },
    yAxis: { title: { text: 'HIV Negative Tests' } },
    subtitle: getLineChartSubtitle(shinyCountry),
    // plotOptions: { series: { pointStart: 2015 } }
    // tooltip: { valueSuffix: ' thousand' },
  }
  return _.merge({}, getArea({ title, series, options }))
}

const getHivPositive = (data, shinyCountry=false, forExport=false) => {
  const { yearRange } = CHARTS.HIV_POSITIVE
  const title = '<span class="hivp-title">HIV-positive</span> tests - new diagnoses and re-diagnoses'

  const dataMap = {
    ['retests']: { points: [] },
    // ['arts']: { points: [] },
    // ['awares']: { points: [] },
    ['news']: { points: [] },
  }

  _.each(dataMap, (obj, ind) => {
    const rows = data[ind] // only for 'news'

    yearRange.forEach((y, i) => {
      let row = _.get(rows, i)

      if (ind === 'retests') {
        const artRow = _.get(data, ['arts', i])
        const awareRow = _.get(data, ['awares', i])
        const artRowVal = _.get(artRow, FIELD_MAP.VALUE, 0)
        const awareRowVal = _.get(awareRow, FIELD_MAP.VALUE, 0)
        // console.log('artRow: ', artRowVal)
        // console.log('awareRow: ', awareRowVal)

        if (artRow && awareRow) {
          row = _.extend({}, artRow, {
            [FIELD_MAP.INDICATOR]: 'retests',
            [FIELD_MAP.VALUE]: artRowVal + awareRowVal,
            [FIELD_MAP.VALUE_UPPER]: undefined,
            [FIELD_MAP.VALUE_LOWER]: undefined,
            [FIELD_MAP.SOURCE_DATABASE]: calculatedDb,
            [FIELD_MAP.NOTES]: `based on ${awareRow[FIELD_MAP.INDICATOR]} and ${artRow[FIELD_MAP.INDICATOR]} indicator values`
,
          })
        } else if (artRow) {
          row = artRow
        } else if (awareRow) {
          row = awareRow
        }

        // console.log('RETEST VALUE: ', _.get(row, 'value'))
      }

      const [point] = getPlotPoints({ row, year: y, forExport })
      if (point) {
        obj.points.push(point)
      }
    })
  })

  if (forExport) {
    return _.flatMap(dataMap, 'points')
  }

  if (isDataMapEmpty(dataMap)) {
    console.warn(title + ' has all empty series.')
    return null
  }
  
  const options = {
    title: { useHTML: true },
    xAxis: { ceiling: Number(_.last(yearRange)), floor: Number(yearRange[0]) },
    yAxis: { title: { text: 'HIV Positive tests' } },
    subtitle: getLineChartSubtitle(shinyCountry),
  }
  const series = [
    {
      name: 'Re-diagnosis',
      description: TERM_MAP.reDiagnosis.definition,
      color: stormGray,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
      data: dataMap.retests.points,
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
    // {
    //   name: 'Retest - know status not on ART',
    //   description: TERM_MAP.retest.definition,
    //   color: botticelli,
    //   tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
    //   data: dataMap.awares.points,
    //   zIndex: 1,
    // },
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
      color: copper,
      tooltip: { pointFormatter: getUncertaintyTooltipFormatter(shinyCountry) },
      data: dataMap.news.points,
      zIndex: 1,
    },
    // {
    //   name: 'New diagnosis15+) range',
    //   data: dataMap.news.rPoints,
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

const getPrevalence = (data, shinyCountry=false, forExport=false) => {
  let { title, nonShinyTitle, yearRange } = CHARTS.PREVALENCE
  title = shinyCountry ? title : nonShinyTitle

  const options = {
    plotOptions: { series: {
      marker: { radius: 3 },
      softThreshold: true
    } },
    subtitle: getLineChartSubtitle(shinyCountry),
    xAxis: { ceiling: Number(_.last(yearRange)), floor: Number(yearRange[0]) },
    yAxis: { min: 0 },
  }

  const prevalenceData = []
  const rPrevalenceData = []
  const positivityData = [] // for shiny
  const rPositivityData = [] // for shiny
  const dYieldData = [] // for shiny
  const rDYieldData = [] // for shiny
  const adjPrevData = []
  yearRange.forEach((y, i) => {
    const prevalenceRow = _.get(data, ['prevalence', i])
    const [prevalencePoint, rPrevalencePoint] = getPlotPoints({ row: prevalenceRow, year: y, decimals: 1, forExport })
    if (prevalencePoint) {
      prevalenceData.push(prevalencePoint)
      rPrevalenceData.push(rPrevalencePoint)
    }

    const populationValue = _.get(data, ['population', i, [FIELD_MAP.VALUE]])
    const onArtValue = _.get(data, ['onArt', i, [FIELD_MAP.VALUE]])
    const plhivValue = _.get(data, ['plhiv', i, [FIELD_MAP.VALUE]])
    const isCameroon = _.get(data, ['plhiv', i, [FIELD_MAP.COUNTRY_ISO_CODE]]) === 'CMR'

    let adjPrevValue
    // NOTE ** conditional country tweak **
    if (populationValue && onArtValue && plhivValue && !isCameroon) {
      adjPrevValue = (
        (plhivValue - onArtValue) * 100 /
        (populationValue - onArtValue)
      )
    }
    if (adjPrevValue) {
      const adjPrevPoint = { x: Number(y), y: adjPrevValue, decimals: 1 }
      if (forExport) {
        adjPrevPoint[FIELD_MAP.VALUE] = adjPrevValue
        adjPrevPoint[FIELD_MAP.INDICATOR] = 'Treatment adjusted Prevalence'
        adjPrevPoint[FIELD_MAP.SOURCE_DATABASE] = calculatedDb,
        adjPrevPoint[FIELD_MAP.YEAR] = y,
        adjPrevPoint[FIELD_MAP.NOTES] = 'based on population, estimated PLHIV, and estimated PLHIV on ART data values'
      }
      adjPrevData.push(adjPrevPoint)
    }

    if (shinyCountry) {
      const positivityRow = _.get(data, ['positivity', i])
      const dYieldRow = _.get(data, ['dYield', i])
      const [positivityPoint, rPositivityPoint] = getPlotPoints({ row: positivityRow, year: y, adjust: true, decimals: 1, forExport })
      if (positivityPoint) {
        positivityData.push(positivityPoint)
        rPositivityData.push(rPositivityPoint)
      }
      const [dYieldPoint, rDYieldPoint] = getPlotPoints({ row: dYieldRow, year: y, adjust: true, decimals: 1, forExport })
      if (dYieldPoint) {
        dYieldData.push(dYieldPoint)
        rDYieldData.push(rDYieldPoint)
      }
    }
  })

  if (forExport) {
    return [...prevalenceData, ...positivityData, ...dYieldData, ...adjPrevData]
  }

  if ([prevalenceData, adjPrevData, positivityData, dYieldData].every(s => s.length <= 1)) {
    console.warn(title + ' has all empty series.')
    return null
  }

  const series = [
    {
      name: 'HIV prevalence',
      description: TERM_MAP.hivPrevalence.definition,
      zIndex: 1,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      color: gunSmoke,
      dashStyle: 'ShortDot',
      marker: { radius: 1 },
      lineType: 'line',
      data: prevalenceData,
    }, {
      name: 'Prevalence range',
      // pointStart: 2015,
      data: rPrevalenceData,
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: gunSmoke,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
  ]

  if (adjPrevData.length) {
    series.push(
      {
        name: 'Treatment adjusted prevalence',
        description: TERM_MAP.treatmentAdjustedPrevalence.definition,
        zIndex: 1,
        color: buddhaGold,
        tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
        data: adjPrevData
      },
    )
  }

  if (shinyCountry) {
    const shinyAdditions = [{
      name: 'Positivity',
      description: TERM_MAP.positivity.definition,
      zIndex: 1,
      color: putty,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      data: positivityData
    }, {
      name: 'Positivity range',
      // pointStart: 2015,
      data: rPositivityData,
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: putty,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    }, {
      name: 'Diagnostic yield',
      description: TERM_MAP.diagnosticYield.definition,
      zIndex: 1,
      color: jungleMist,
      tooltip: { pointFormatter: getPercentUncertaintyTooltipFormatter(shinyCountry) },
      data: dYieldData
    }, {
      name: 'Diagnostic yield range',
      // pointStart: 2015,
      data: rDYieldData,
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: jungleMist,
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    }]
    series.push(...shinyAdditions)
  }

  return _.merge({}, getLine({ series, options, title, spline: false }))
}


function getColumnPoints(numData, posData) {
  
  const {
    [FIELD_MAP.VALUE]: y,
    [FIELD_MAP.SOURCE_DATABASE]: source,
    [FIELD_MAP.YEAR]: year,
    noData
  } = numData

  const {
    [FIELD_MAP.SOURCE_DATABASE]: pSource,
    [FIELD_MAP.YEAR]: pYear,
    noData: pNoData
  } = posData
  
  const numPoint = noData ? null : {
    y,
    source,
    year,
    mismatched: (source !== pSource) || (year !== pYear)
  }

  // don't show positivity if there's no nonzero num value, or no posData
  const posPoint = (!y || pNoData) ? null : {
    y: adjustPercentage({ row: posData }),
    source: SOURCE_DISPLAY_MAP[pSource] || pSource,
    year: pYear,
  }

  return [numPoint, posPoint]
}

const getAdults = (data, shinyCountry=false, forExport=false) => {
  const { title, indicatorIds, sources } = CHARTS.ADULTS

  const { 
    total, men, women,
    pTotal, pMen, pWomen, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  if (forExport) {
    return [women, pWomen, men, pMen, total, pTotal].map(row =>
      adjustPercentage({ row, returnRow: true }))
  }

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

  if (!wNumData && !wPosData && !mNumData && !mPosData && total.noData && pTotal.noData) {
    console.warn(title + ' has all empty series.')
    return null
  }

  const series = [
    {
      name: barChartsTestsName,
      tooltip: {
        pointFormatter: sourceTooltipFormatter
      },
      data: [wNumData, mNumData]
    },
    {
      name: barChartsPositivityName,
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [wPosData, mPosData]
    }
  ]
  const categories = ['Women (15+)', 'Men (15+)']

  const options = {
    customHeader: getColumnChartCustomHeader(total, pTotal, title),
    chart: {
      height: WITH_CUSTOM_HEADER_CHART_HEIGHT,
      spacing: WITH_CUSTOM_HEADER_CHART_SPACING
    }
  }
  return _.merge({}, getColumnScat({ series, options, categories }))
}

const getCommunity = (data, shinyCountry=false, forExport=false) => {
  const { title, indicatorIds, sources } = CHARTS.COMMUNITY

  const {
    total, mobile, VCT, other,
    pTotal, pMobile, pVCT, pOther, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  // console.log('total: ', total, 'mobile: ', mobile, 'VCT: ', VCT, 'other: ', other, 'pTotal: ', pTotal, 'pMobile: ', pMobile, 'pVCT: ', pVCT, 'pOther: ', pOther, 'missingIndicators: ', missingIndicators)

  if (forExport) {
    return [mobile, pMobile, VCT, pVCT, other, pOther, total, pTotal].map(row =>
      adjustPercentage({ row, returnRow: true }))
  }

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

  if (!mobileNumData && !mobilePosData && !vctNumData && !vctPosData && !otherNumData && !otherPosData && total.noData && pTotal.noData) {
    console.warn(title + ' has all empty series.')
    return null
  }
  
  const series = [
    {
      name: barChartsTestsName,
      tooltip: {
        pointFormatter: sourceTooltipFormatter
      },
      data: [mobileNumData, vctNumData, otherNumData]
    },
    {
      name: barChartsPositivityName,
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [mobilePosData, vctPosData, otherPosData]
    }
  ]

  const options = {
    customHeader: getColumnChartCustomHeader(total, pTotal, title),
    chart: {
      height: WITH_CUSTOM_HEADER_CHART_HEIGHT,
      spacing: WITH_CUSTOM_HEADER_CHART_SPACING
    }
  }
  const categories = ['Mobile Testing', 'VCT', 'Other']
  return _.merge({}, getColumnScat({ series, options, categories }))
}

const getFacility = (data, shinyCountry=false, forExport=false) => {
  const { title, indicatorIds, sources } = CHARTS.FACILITY

  const {
    total, PITC, ANC, VCT, family, other,
    pTotal, pPITC, pANC, pVCT, pFamily, pOther, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  if (forExport) {
    return [PITC, pPITC, ANC, pANC, VCT, pVCT, family, pFamily, total, pTotal].map(row =>
      adjustPercentage({ row, returnRow: true }))
  }

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

  if (!pitcNumData && !pitcPosData && !ancNumData && !ancPosData && !vctNumData && !vctPosData && 
    !familyNumData && !familyPosData && !otherNumData && !otherPosData && total.noData && pTotal.noData) {
    console.warn(title + ' has all empty series.')
    return null
  }
  
  const series = [
    {
      name: barChartsTestsName,
      tooltip: {
        pointFormatter: sourceTooltipFormatter
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
    customHeader: getColumnChartCustomHeader(total, pTotal, title),
    chart: {
      height: WITH_CUSTOM_HEADER_CHART_HEIGHT,
      spacing: WITH_CUSTOM_HEADER_CHART_SPACING
    }
  }
  const categories = ['PITC', 'ANC', 'VCT', 'Family Planning Clinic', 'Other']
  // const options = { xAxis: { categories: ['Community', 'Facility']} }
  return _.merge({}, getColumnScat({ options, categories, series }))
}

const getIndex = (data, shinyCountry=false, forExport=false) => {

  const { title, indicatorIds, sources } = CHARTS.INDEX

  const {
    total, community, facility,
    pTotal, pCommunity, pFacility, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)


  if (forExport) {
    return [community, pCommunity, facility, pFacility, total, pTotal].map(row =>
      adjustPercentage({ row, returnRow: true }))
  }

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
  
  if (!communityNumData && !communityPosData && !facilityNumData && !facilityPosData && total.noData && pTotal.noData) {
    console.warn(title + ' has all empty series.')
    return null
  }
  
  const series = [
    {
      name: barChartsTestsName,
      tooltip: {
        pointFormatter: sourceTooltipFormatter
      },
      data: [communityNumData, facilityNumData]
    },
    {
      name: barChartsPositivityName,
      type: 'line',
      tooltip: {
        pointFormatter: percentSourceTooltipFormatter
      },
      data: [communityPosData, facilityPosData]
    }
  ]
  const options = {
    customHeader: getColumnChartCustomHeader(total, pTotal, title),
    chart: {
      height: WITH_CUSTOM_HEADER_CHART_HEIGHT,
      spacing: WITH_CUSTOM_HEADER_CHART_SPACING
    }
  }
  const categories = ['Community', 'Facility']
  return _.merge({}, getColumnScat({ options, categories, series }))
}

const getForecast = (data, shinyCountry=false, forExport=false) => {
  const { title, indicatorIds, indicatorYears, sources } = CHARTS.FORECAST

  const {
    distributed, demand, need, missingIndicatorMap
  } = extractPrioritizedRangeData(
    { data, indicatorIds, sourceCount: sources.length, indicatorRangeMap: indicatorYears }
  )


  if (forExport) {
    // TODO
    // return []
  }


  const missingIndicators = Object.keys(missingIndicatorMap)

  console.log('distributed: ', distributed, 'demand: ', demand, 'need: ', need, 'missingIndicators: ', missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const distributedNumData = distributed.filter(r => !r.noData).map(r => {
    const {
      [FIELD_MAP.VALUE]: y,
      [FIELD_MAP.SOURCE_DATABASE]: source,
      [FIELD_MAP.YEAR]: year,
    } = r
    

    const point = {
      y, x: Number(year), source, year, mismatched: true,
    }

    if (forExport) {
      CSV_FIELDS.forEach(({ fieldId }) => {
        if (_.isUndefined(point[fieldId])) {
          point[fieldId] = r[fieldId] || ''
        }
      })
    }

    return point
  })
  //   ({
  //   x: Number(d.year),
  //   y: d.value,
  //   source: d[FIELD_MAP.SOURCE_DATABASE]
  // }))

  const demandNumData = demand.filter(r => !r.noData).map(d => ({
    x: Number(d.year),
    y: d.value,
  }))

  const needNumData = need.filter(r => !r.noData).map(d => ({
    x: Number(d.year),
    y: d.value,
    source: d[FIELD_MAP.SOURCE_DATABASE]
  }))

  if (forExport) {
    return [...distributedNumData, ...demandNumData, ...needNumData]
  }

  if (!distributedNumData.length && !demandNumData.length && !needNumData.length) {
    console.warn(title + ' has all empty series.')
    return null
  }

  // COLORS: explore previous - cerulean, purple etc
  const options = {
    subtitle: { text: 'Programme data and modelled estimates' },
    // plotOptions: { series: { pointStart: 2019 } }
  }
  const series = [
    {
      name: 'HIVSTs distributed',
      data: distributedNumData,
      tooltip: {
        pointFormatter: sourceTooltipFormatter // TODO: use formatter?
      },
    },
    // {
    //   name: 'HIVST forecast demand',
    //   data: demandNumData,
    // },
    // {
    //   name: 'HIVST forecast need',
    //   type: 'line',
    //   data: needNumData,
    //   tooltip: {
    //     // pointFormat: sourceTooltipFormat // TODO: use formatter?
    //   },
    // }
  ]

  return _.merge({}, getColumn({ title, series, options }))
}

const getKpTable = (data, shinyCountry=false, forExport=false) => {
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

  if (forExport) {
    return [
      prevSw, awareSw, yearSw,
      prevMsm, awareMsm, yearMsm,
      prevPwid, awarePwid, yearPwid,
      prevTrans, awareTrans, yearTrans,
      prevPris, awarePris, yearPris, 
    ]
  }

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

const getPolicyTable = (data, shinyCountry=false, forExport=false) => {
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

  if (forExport) {
    // NOTE: ** conditional tweak ** 
    // for some indicators WHO wants to display the SOURCE_YEAR as the YEAR
    return [
      age,
      _.extend({}, provider, { [FIELD_MAP.YEAR]: provider[FIELD_MAP.SOURCE_YEAR] }),
      _.extend({}, community, { [FIELD_MAP.YEAR]: community[FIELD_MAP.SOURCE_YEAR] }),
      _.extend({}, lay, { [FIELD_MAP.YEAR]: lay[FIELD_MAP.SOURCE_YEAR] }),
      hivst,
      _.extend({}, assisted, { [FIELD_MAP.YEAR]: assisted[FIELD_MAP.SOURCE_YEAR] }),
      _.extend({}, social, { [FIELD_MAP.YEAR]: social[FIELD_MAP.SOURCE_YEAR] }),
      compliance,
      verification,
    ]
  }

  const config = {
    title,
    data: [{ 
      rowName: 'Laws requiring parental consent for adolescents to access HIV testing',
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

const getGroupsTable = (data, shinyCountry=false, forExport=false) => {
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
      [FIELD_MAP.SOURCE_DATABASE]: awareSource, // for adjustment
      // forExport
      [FIELD_MAP.YEAR]: awareYear,
      [FIELD_MAP.SEX]: awareSex,
      [FIELD_MAP.AGE]: awareAge,
    } = _.get(allData, ['aware', dem], {})
    
    let { 
      [FIELD_MAP.VALUE]: plhivVal,
      [FIELD_MAP.YEAR]: plhivYear,
      // [FIELD_MAP.SOURCE_DATABASE]: plhivSource
    } = _.get(allData, ['plhiv', dem], {})
    
    if (!awareVal || !plhivVal) {
      return { noData: true }
    }
    
    // not a source tweak, just for our own calc
    if (awareSource === SOURCE_DB_MAP.SPEC20) {
      awareVal/=100
    }
    
    return { 
      value: ((1-awareVal) * plhivVal),
      // forExport
      [FIELD_MAP.SEX]: awareSex,
      [FIELD_MAP.INDICATOR]: 'Undiagnosed PLHIV',
      [FIELD_MAP.AGE]: awareAge,
      [FIELD_MAP.YEAR]: (awareYear === plhivYear) ? plhivYear : '',
      [FIELD_MAP.SOURCE_DATABASE]: calculatedDb,
      [FIELD_MAP.NOTES]: 'based on the estimated PLHIV and % aware data values',
    }
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
    const rowData = {}
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

      // prepare values for display.
      // if forExport, all we want is to standardize percentages
      _.each(vMap, (v, vId) => {
        if (_.isNumber(v)) {
          // if ((ind === 'aware' || ind === 'prev') && source === SOURCE_DB_MAP.SPEC20) {
          //   v = v / 100
          // }
          const percentages = ['aware', 'prev', 'ever']
          if (percentages.includes(ind)) {
            // NOTE: ** conditional source tweak **
            const adjust = (source === SOURCE_DB_MAP.S90) && (v <= 1)
            if (forExport) {
              v = adjust ? (v * 100) : v
            } else {
              const decimals = ind === 'prev' ? 1 : 0
              v = displayPercent({ v, adjust, decimals })
            }
          } else if (!forExport) {
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
      if (forExport) {
        // IMPORTANT - we copy over values from vMap (rather than from row directly) as they may have been tweaked
        rowData[ind][FIELD_MAP.VALUE] = vMap.value
        rowData[ind][FIELD_MAP.VALUE_LOWER] = vMap.valueLower
        rowData[ind][FIELD_MAP.VALUE_UPPER] = vMap.valueUpper
        CSV_FIELDS.forEach(({ fieldId }) => {
          if (_.isUndefined(rowData[ind][fieldId])) {
            rowData[ind][fieldId] = indDemoData[fieldId] || ''
          }
        })
      }
    })
  })

  if (forExport) {
    return _.flatMap(config.dataMap, ind => _.flatMap(ind))
  }
  
  return config
}

const getExportData = (data, counttryCode, shinyCountry=false) => {
  const headers = _.map(CSV_FIELDS, 'fieldId')
  const valueArrays = [['chart', ...headers]]

  try {
    _.each(ALL_CHARTS, chart => {
      if (chart.shinyOnly && !shinyCountry) {
        return
      }

      // the "export config" is an array of the data rows used to build the chart
      const chartExportConfig = getConfig(chart.id, data, shinyCountry, true)

      _.each(chartExportConfig, row => {
        if (!row || row.noData) {
          return
        }
        
        const rowValues = _.map(CSV_FIELDS, f => {
          let v = row[f.fieldId]
          // seems new lines are fine
          // v = v.replace(/\n/gm, '')
          if (!v) {
            return ''
          }
          v = String(v).replace(/"/gm, "'")
          return `"${v}"`
        })
        valueArrays.push([`"${chart.title}"`, ...rowValues])
      })
    })

    let csv = ''
    _.each(valueArrays, r => {
      csv += r.join(',')
      csv += '\n'
    })

    const hiddenElement = document.createElement('a')
    // encodeURI broke on #:
    // https://stackoverflow.com/questions/55267116/how-to-download-csv-using-a-href-with-a-number-sign-in-chrome
    hiddenElement.href = 'data:text/csvcharset=UTF-8,' + encodeURIComponent(csv)
    hiddenElement.target = '_blank'
    hiddenElement.download = `WHO HTS Data - ${counttryCode}.csv`
    hiddenElement.click()
    hiddenElement.remove()
  } catch (error) {
    console.error('Unable to export to CSV. Error: ' + error)
  }
}

export {
  getConfig,
  getExportData,
  adjustPercentage,
  displayPercent,
  displayNumber,
}
