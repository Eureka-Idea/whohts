import colors, {femaleColor, maleColor, barChartAccent, barChartColorDark } from "./colors"
import _ from 'lodash'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import { CHARTS, R_2015_2019, FIELD_MAP } from "../../constants/charts";
import { TERM_MAP } from "../../constants/glossary";

const uncertaintyTooltipFormat = `
  <span style="color:{point.color}">●</span>
  {series.name}: <b>{point.y}</b><br/>
  Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
  Source: ******` // todo: fill in actual source on point

const sourceTooltipFormat = `
  <span style="color:{point.color}">●</span>
  {series.name}: <b>{point.y}</b><br/>
  Year: <b>{point.year}</b><br/>
  Source: <b>{point.source}</b><br/>
  Source year: <b>{point.sourceYear}</b><br/>
  `

const barChartsTestsName = 'Number of tests conducted'
const barChartsPositivityName = 'Positivity (%)'

// const pointFactor = ({ value, })

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

const extractPrioritizedData = (data, indicatorIds, sourceCount) => {
  const result = { missingIndicators: [] }
  _.each(indicatorIds, ind => {

    for (let i = 1; i <= sourceCount; i++) {
      const indicatorResult = _.get(data, ind+i, null)
      if (indicatorResult) {
        result[ind] = indicatorResult
        break
      } else if (i === sourceCount) {
        result[ind] = { value: 0, noData: true, [FIELD_MAP.SOURCE_DATABASE]: 'no data' }
        result.missingIndicators.push(ind)
      }
    }
    
  })

  return result
}

const extractPrioritizedRangeData = (data, indicatorIds, sourceCount, indicatorYears) => {
  const result = { missingIndicatorMap: {} }
  _.each(indicatorIds, ind => {

    const range = indicatorYears[ind]
    if (!range) {
      console.error('No range provided for indicator: ', ind)
      return
    }

    result[ind] = _.map(range, (y, ri) => {

      for (let i = 1; i <= sourceCount; i++) {
        const indicatorResult = _.get(data, [ind+i, ri], null) // eg _.get({ ind1: [ 3, null ], ind2: [1, 5] }, ['ind'+2, 1]) => 5
        if (indicatorResult) {
          return indicatorResult
        } else if (i === sourceCount) {
          _.set(result.missingIndicatorMap, [ind, y], true)
          return { value: 0, year: y, noData: true, [FIELD_MAP.SOURCE_DATABASE]: 'no data' }
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
    const onArtValue = _.get(data, ['onArt', i, 'median', 'value'], null)
    const plhivValue = _.get(data, ['plhiv', i, 'median', 'value'])
    const knowValue = _.get(data, ['know', i, 'median', 'value'])

    const undiagnosedValue = (plhivValue - knowValue) || null
    const notArtValue = (plhivValue - onArtValue) || null
    
    onArtData.push({ x: Number(y), y: onArtValue })
    notArtData.push({ x: Number(y), y: notArtValue })
    undiagnosedData.push({ x: Number(y), y: undiagnosedValue })
  })
  
  // const [plhiv, know, onArt] = ['plhiv', 'know', 'onArt'].map(ind => {
  //   const indData = data[ind] || Array(5).fill(null)
  //   return _.map(indData, 'median.value')
  // })
  
  const series = [
    {
      name: 'Undiagnosed PLHIV',
      description: TERM_MAP.undiagnosedPlhiv.definition,
      // color: colors[1] + '97',
      data: undiagnosedData,
    },
    {
      name: 'PLHIV know status not on ART',
      description: TERM_MAP.plhivWhoKnowStatusNotOnArt.definition,
      // color: colors[2] + '97',
      data: notArtData,
    },
    {
      name: 'PLHIV know status on ART',
      description: TERM_MAP.plhivKnowStatusOnArt.definition,
      // color: colors[0] + '97',
      data: onArtData,
    },
  ]
  return _.merge({}, getArea({ title, series, options }))
}

const getPlhivSex = data => {
  const { title } = CHARTS.PLHIV_SEX
  const options = {
    legend: { symbolWidth: 40 },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    plotOptions: { series: { pointStart: 2015 } }
  }

  const femaleXYValues = _.compact(data.females).map(d => {
    return ({
      x: Number(d.year),
      y: d.value,
    })
  })
  const maleXYValues = _.compact(data.males).map(d => {
    return ({
      x: Number(d.year),
      y: d.value,
    })
  })

  const series = [
    {
      name: 'Men',
      color: maleColor,
      dashStyle: 'solid',
      data: maleXYValues,
    },
    {
      name: 'Women',
      color: femaleColor,
      dashStyle: 'Solid',
      data: femaleXYValues,
    },
  ]
  return _.merge({}, getLine({ title, series, options }))
}

const getPlhivAge = data => {
  const { title } = CHARTS.PLHIV_AGE

  const options = {
    legend: { symbolWidth: 40 },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    plotOptions: { series: { pointStart: 2015 } }
  }

  const d15 = data['15-24'] || Array(5).fill(null)
  const d15Values = d15.map(d => {
    const v = _.get(d, 'median.value')
    return v ? v * 100 : null
  })
  const d25 = data['25-34'] || Array(5).fill(null)
  const d25Values = d25.map(d => {
    const v = _.get(d, 'median.value')
    return v ? v * 100 : null
  })
  const d35 = data['35-49'] || Array(5).fill(null)
  const d35Values = d35.map(d => {
    const v = _.get(d, 'median.value')
    return v ? v * 100 : null
  })
  const d50 = data['50-99'] || Array(5).fill(null)
  const d50Values = d50.map(d => {
    const v = _.get(d, 'median.value')
    return v ? v * 100 : null
  })

  const series = [
    {
      name: '15 - 24',
      dashStyle: 'ShortDot',
      data: d15Values
    },
    {
      name: '25 - 34',
      dashStyle: 'DashDot',
      data: d25Values
    },
    {
      name: '35 - 49',
      dashStyle: 'LongDash',
      data: d35Values
    },
    {
      name: '50+',
      // color: colors[8],
      dashStyle: 'Solid',
      data: d50Values
    },
  ]

  return _.merge({}, getLine({ title, series, options }))
}

const getHivNegative = data => {
  const title = '<span class="hivn-title">HIV-negative</span> tests - first-time testers and repeat testers'

  const retests = data.retests || Array(5).fill(null)
  const retestsValues = retests.map(d => {
    return _.get(d, 'median.value')
  })
  const firsts = data.firsts || Array(5).fill(null)
  const firstsValues = firsts.map(d => {
    return _.get(d, 'median.value')
  })
  const series = [
    {
      name: 'Retest',
      description: TERM_MAP.retest.definition,
      // color: colors[4] + '97',
      data: retestsValues

    },
    {
      name: 'First test',
      description: TERM_MAP.firstTest.definition,
      // color: colors[9] + '90',
      data: firstsValues
    },
  ]
  const options = {
    title: { useHTML: true },
    yAxis: { title: { text: 'HIV Negative Tests' } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    plotOptions: { series: { pointStart: 2010 } }
    // tooltip: { valueSuffix: ' thousand' },
  }
  return _.merge({}, getArea({ title, series, options }))
}

const getHivPositive = data => {
  const title = '<span class="hivp-title">HIV-positive</span> tests - new diagnoses and retests'

  const [art, aware, first] = ['arts', 'awares', 'firsts'].map(ind => {
    const indData = data[ind] || Array(5).fill(null)
    return _.map(indData, 'median.value')
  })

  const options = {
    title: { useHTML: true },
    yAxis: { title: { text: 'HIV Positive tests' } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    plotOptions: { series: { pointStart: 2015 } } // TODO no pointstart
    // tooltip: { pointFormat: '{series.name}: <b>{point.y:.0f} million</b>' },
    // yAxis: { max: 58*2 },
    // tooltip: { valueSuffix: ',000' },
  }
  const series = [
    {
      name: 'Retest - know status on ART',
      description: TERM_MAP.retest.definition,
      // color: colors[0] + '97',
      data: art
    },
    {
      name: 'Retest - know status not on ART',
      description: TERM_MAP.retest.definition,
      // color: colors[2] + '97',
      data: aware
    },
    {
      name: 'New diagnosis',
      description: TERM_MAP.newDiagnosis.definition,
      // color: colors[1] + '97',
      data: first
    },
  ]
  return _.merge({}, getArea({ title, series, options }))
}

const getPrevalence = (data, shinyCountry) => {
  const { title } = CHARTS.PREVALENCE

  const options = {
    plotOptions: { series: { marker: { radius: 3 } } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    // plotOptions: { series: { pointStart: 2015 } }
    // legend: {
    //   useHTML: true,
    //   labelFormatter: function() {
    //     console.log(this.name, this)
    //     return `<span title='${this.userOptions.description}'>${this.name}</span>`
    //   }
    // },
  }

  const prevalenceData = []
  const positivityData = [] // for shiny
  const dYieldData = [] // for shiny
  const adjPrevData = []
  R_2015_2019.forEach((y, i) => {
    // TODO: calc uci/lci
    const prevalenceValue = _.get(data, ['prevalence', i, 'median', 'value'])
    prevalenceData.push({ x: Number(y), y: prevalenceValue })

    const populationValue = _.get(data, ['population', i, 'value'])
    const onArtValue = _.get(data, ['onArt', i, 'value'])
    const plhivValue = _.get(data, ['plhiv', i, 'median', 'value'])

    const adjPrevValue = (
      (plhivValue - onArtValue) /
      (populationValue - onArtValue)
    )
    adjPrevData.push({ x: Number(y), y: adjPrevValue })
    
    if (shinyCountry) {
      const positivityValue = _.get(data, ['positivity', i, 'median', 'value'])
      const dYieldValue = _.get(data, ['dYield', i, 'median', 'value'])
      positivityData.push({ x: Number(y), y: positivityValue * 100 })
      dYieldData.push({ x: Number(y), y: dYieldValue * 100 })
    }
  })
  
  // // TODOxx
  // const dyDataArr = [
  //   2, 3, 3, 5, 6,
  //   9, 11, 14, 17, 21,
  // ]

  // const dyRange = dyDataArr.map(v => {
  //   const u = v + Math.floor(Math.random() * 2.5)
  //   const l = v - Math.floor(Math.random() * 2.5)
  //   return [l, u]
  // })

  // const dyDataObj = dyRange.map(([l, u], i) => {
  //   const y = dyDataArr[i]
  //   return { y, l, u }
  // })


  // const tapDataArr = [
  //   2, 3, 3, 5, 6,
  //   9, 11, 14, 17, 21,
  // ]

  // const tapRange = tapDataArr.map(v => {
  //   const u = v + Math.floor(Math.random() * 2.5)
  //   const l = v - Math.floor(Math.random() * 2.5)
  //   return [l, u]
  // })

  // const tapDataObj = tapRange.map(([l, u], i) => {
  //   const y = tapDataArr[i]
  //   return { y, l, u }
  // })



  let series = [
    {
      name: 'HIV prevalence',
      shinyInclude: true,
      description: TERM_MAP.hivPrevalence.definition,
      zIndex: 1,
      tooltip: { pointFormat: uncertaintyTooltipFormat },
      dashStyle: 'ShortDot',
      marker: { radius: 1 },
      lineType: 'line',
      data: prevalenceData,
      // data: [
      //   { y: 43, l: 39, u: 46 }, { y: 43, l: 39, u: 44 }, { y: 42, l: 38, u: 43 }, { y: 42, l: 38, u: 43 }, { y: 42, l: 37, u: 42 },
      //   { y: 41, l: 37, u: 42 }, { y: 41, l: 37, u: 42 }, { y: 41, l: 37, u: 42 }, { y: 41, l: 36, u: 42 }, { y: 40, l: 36, u: 41 },
      // ].map(o => _.each(o, (v, k) => o[k] *= .4)),
    }, {
      name: 'Prevalence range',
      shinyInclude: true,
      data: [],
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[0],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
    {
      name: 'Positivity',
      description: TERM_MAP.positivity.definition,
      // dashStyle: 'ShortDot',
      zIndex: 1,
      tooltip: { pointFormat: uncertaintyTooltipFormat },
      data: positivityData
      // data: [ // todo: on import, format l&u into string (as to deal with missing data pre-pointFormat)
      //   { y: 2, l: 1, u: 4 }, { y: 3, l: 2, u: 6 }, { y: 3, l: 2, u: 5 }, { y: 5, l: 3, u: 7 }, { y: 6, l: 5, u: 8 },
      //   { y: 9, l: 8, u: 9 }, { y: 11, l: 8, u: 12 }, { y: 14, l: 13, u: 15 }, { y: 17, l: 14, u: 19 }, { y: 21, l: 16, u: 23 },
      // ].reverse(),
    }, {
      name: 'Positivity range',
      data: [],
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[1],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    }, {
      name: 'Diagnostic yield',
      description: TERM_MAP.diagnosticYield.definition,
      zIndex: 1,
      tooltip: { pointFormat: uncertaintyTooltipFormat },
      // dashStyle: 'DashDot',
      data: dYieldData
    }, {
      name: 'Diagnostic yield range',
      data: [],
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[2],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    }, {
      name: 'Treatment adjusted prevalence',
      description: TERM_MAP.treatmentAdjustedPrevalence.definition,
      zIndex: 1,
      color: colors[9],
      // dashStyle: 'LongDash',
      tooltip: { pointFormat: uncertaintyTooltipFormat },
      data: adjPrevData
    }, {
      name: 'Treatment adjusted prevalence range',
      data: [],
      type: 'arearange',
      enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      lineWidth: 0,
      linkedTo: ':previous',
      color: colors[9],
      fillOpacity: 0.2,
      zIndex: 0,
      marker: { enabled: false }
    },
  ]
  // if (!shiny) {
  //   series = series.filter(s => s.shinyInclude)
  // }
  return _.merge({}, getLine({ series, options, title, spline: false }))
}

const getAdults = data => {
  const { title, indicatorIds, sources } = CHARTS.ADULTS

  const { 
    total, men, women,
    pTotal, pMen, pWomen, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)
  
  console.log('total: ',total, 'men: ',men, 'women: ',women, 'pTotal: ',pTotal, 'pMen: ',pMen, 'pWomen: ',pWomen, 'missingIndicators: ',missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }
  
  const wNumData = {
    y: women.value,
    // source: women[FIELD_MAP.SOURCE_DATABASE]
  }
  const mNumData = {
    y: men.value,
    // source: men[FIELD_MAP.SOURCE_DATABASE]
  }

  const wPosData = {
    y: pWomen.value,
    source: pWomen[FIELD_MAP.SOURCE_DATABASE],
    year: pWomen[FIELD_MAP.YEAR],
    sourceYear: pWomen[FIELD_MAP.SOURCE_YEAR],
  }
  const mPosData = {
    y: pMen.value,
    source: pMen[FIELD_MAP.SOURCE_DATABASE],
    year: pMen[FIELD_MAP.YEAR],
    sourceYear: pMen[FIELD_MAP.SOURCE_YEAR],
  }

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
      data: [wNumData, mNumData]
    },
    {
      name: 'Positivity (%)',
      // color: barChartAccent,
      type: 'line',
      tooltip: {
        pointFormat: sourceTooltipFormat
      },
      data: [wPosData, mPosData]
    }
  ]
  const categories = ['Women', 'Men']

  // TODO should be weighted avg of %
  const options = {
    subtitle: { text: `Total tests: ${total.value}, Average positivity: ${pTotal.value}%` }
  }
  return _.merge({}, getColumnScat({ title, series, options, categories }))
}

const getCommunity = data => {
  const { title, indicatorIds, sources } = CHARTS.COMMUNITY

  const {
    total, mobile, VCT, other,
    pTotal, pMobile, pVCT, pOther, missingIndicators
  } = extractPrioritizedData(data, indicatorIds, sources.length)

  console.log('total: ', total, 'mobile: ', mobile, 'VCT: ', VCT, 'other: ', other, 'pTotal: ', pTotal, 'pMobile: ', pMobile, 'pVCT: ', pVCT, 'pOther: ', pOther, 'missingIndicators: ', missingIndicators)
  
  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const mobileNumData = {
    y: mobile.value,
  }
  const vctNumData = {
    y: VCT.value,
  }
  const otherNumData = {
    y: other.value,
  }

  const mobilePosData = {
    y: pMobile.value,
    source: pMobile[FIELD_MAP.SOURCE_DATABASE],
    year: pMobile[FIELD_MAP.YEAR],
    sourceYear: pMobile[FIELD_MAP.SOURCE_YEAR],
  }
  const vctPosData = {
    y: pVCT.value,
    source: pVCT[FIELD_MAP.SOURCE_DATABASE],
    year: pVCT[FIELD_MAP.YEAR],
    sourceYear: pVCT[FIELD_MAP.SOURCE_YEAR],
  }
  const otherPosData = {
    y: pOther.value,
    source: pOther[FIELD_MAP.SOURCE_DATABASE],
    year: pOther[FIELD_MAP.YEAR],
    sourceYear: pOther[FIELD_MAP.SOURCE_YEAR],
  }

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
        pointFormat: sourceTooltipFormat
      },
      data: [mobilePosData, vctPosData, otherPosData]
    }
  ]

  const options = {
    subtitle: { text: `Total tests: ${total.value}, Average positivity: ${pTotal.value}%` }
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

  console.log('total: ', total, 'PITC: ', PITC, 'ANC: ', ANC, 'VCT: ', VCT, 'family: ', family, 'other: ', other,
    'pTotal: ', pTotal, 'pPITC: ', pPITC, 'pANC: ', pANC, 'pVCT: ', pVCT, 'pFamily: ', pFamily, 'pOther: ', pOther, 'missingIndicators: ', missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const pitcNumData = {
    y: PITC.value,
  }
  const ancNumData = {
    y: ANC.value,
  }
  const vctNumData = {
    y: VCT.value,
  }
  const familyNumData = {
    y: family.value,
  }
  const otherNumData = {
    y: other.value,
  }

  const pitcPosData = {
    y: pPITC.value,
    source: pPITC[FIELD_MAP.SOURCE_DATABASE],
    year: pPITC[FIELD_MAP.YEAR],
    sourceYear: pPITC[FIELD_MAP.SOURCE_YEAR],
  }
  const ancPosData = {
    y: pANC.value,
    source: pANC[FIELD_MAP.SOURCE_DATABASE],
    year: pANC[FIELD_MAP.YEAR],
    sourceYear: pANC[FIELD_MAP.SOURCE_YEAR],
  }
  const vctPosData = {
    y: pVCT.value,
    source: pVCT[FIELD_MAP.SOURCE_DATABASE],
    year: pVCT[FIELD_MAP.YEAR],
    sourceYear: pVCT[FIELD_MAP.SOURCE_YEAR],
  }
  const familyPosData = {
    y: pFamily.value,
    source: pFamily[FIELD_MAP.SOURCE_DATABASE],
    year: pFamily[FIELD_MAP.YEAR],
    sourceYear: pFamily[FIELD_MAP.SOURCE_YEAR],
  }
  const otherPosData = {
    y: pOther.value,
    source: pOther[FIELD_MAP.SOURCE_DATABASE],
    year: pOther[FIELD_MAP.YEAR],
    sourceYear: pOther[FIELD_MAP.SOURCE_YEAR],
  }

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
      tooltip: {
        pointFormat: `<span style="color:{point.color}">●</span>
          {series.name}: <b>{point.y}</b><br/>
          {point.tooltipAddition}`
      },
      type: 'line',
      tooltip: {
        pointFormat: sourceTooltipFormat
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
      text: `Total tests: ${total.value}, Average positivity: ${pTotal.value}%`
    }
  }
  const categories = ['PITC', 'ANC', 'VCT', 'Family Planning Clinic', 'Other']
  // const options = { xAxis: { categories: ['Community', 'Facility']} }
  return _.merge({}, getColumnScat({ title, options, categories, series }))
}

const getIndex = data => {
  // TODO
  const title = 'Index'
  const series = [
    {
      name: barChartsTestsName,
      // color: barChartColorDark,
      data: [132, 232]
      // dataLabels,
    },
    {
      name: barChartsPositivityName,
      // color: barChartAccent,
      type: 'line',
      data: [21, 30]
    }
  ]
  const options = {
    subtitle: { text: `Total tests: ${_.mean([132, 232])}, Average positivity: ${_.mean([21, 30])}%` }
  }
  const categories = ['Community', 'Facility', 'TOTAL']
  return _.merge({}, getColumnScat({ title, options, categories, series }))
}

const getForecast = data => {
  const { title, indicatorIds, indicatorYears, sources } = CHARTS.FORECAST

  const {
    distributed, demand, need, missingIndicatorMap
  } = extractPrioritizedRangeData(data, indicatorIds, sources.length, indicatorYears)
  const missingIndicators = Object.keys(missingIndicatorMap)

  console.log('distributed: ', distributed, 'demand: ', demand, 'need: ', need, 'missingIndicators: ', missingIndicators)

  if (missingIndicators.length) {
    console.warn('**INCOMPLETE RESULTS. missing: ', missingIndicators.join(', '))
  }

  const distributedNumData = _.compact(distributed).map(d => ({
    x: Number(d.year),
    y: d.value,
    source: d[FIELD_MAP.SOURCE_DATABASE]
  }))

  const demandNumData = _.compact(demand).map(d => ({
    x: Number(d.year),
    y: d.value,
  }))

  const needNumData = _.compact(need).map(d => ({
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
        pointFormat: sourceTooltipFormat
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
        pointFormat: sourceTooltipFormat
      },
    }
  ]

  return _.merge({}, getColumnLine({ title, series, options }))
}

const getKpTable = data => {
  
}

const getPolicyTable = data => {
  
}

const getGroupsTable = data => {
  
}


export {
  getConfig
}
