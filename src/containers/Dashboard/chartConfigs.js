import colors, {femaleColor, maleColor } from "./colors"
import _ from 'lodash'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import { CHARTS } from "../../constants/charts";
import { TERM_MAP } from "../../constants/glossary";

const uncertaintyTooltipFormat = `<span style="color:{point.color}">●</span>
  {series.name}: <b>{point.y}</b><br/>
  Uncertainty range: <b>{point.l}% - {point.u}%</b><br/>
  Source: UNAIDS` // todo: fill in actual source on point

const getConfig = (chartId, chartData) => {
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
    return getter(data)
  } catch (error) {
    console.error(chartId, ' unable to generate config: ', error)
    debugger
    return
  }  
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
    tooltip: { valueSuffix: ' million' },
    yAxis: { title: { text: 'Adults 15+ (millions)' } },
    plotOptions: { series: { pointStart: 2015 } }
    // tooltip: { pointFormat: '{series.name}: <b>{point.y:.0f} million</b>' },
    // yAxis: { max: 58*2 },
  }

  const undiagnosedData = []
  const notArtData = []
  const onArtData = []
  
  data.onArt.forEach((yearRecord, i) => {
    // TODO: calc uci/lci
    const onArtValue = _.get(yearRecord, 'median.value')
    const plhivValue = _.get(data, ['plhiv', i, 'median', 'value'])
    const knowValue = _.get(data, ['know', i, 'median', 'value'])

    const undiagnosedValue = plhivValue - knowValue
    const notArtValue = plhivValue - onArtValue
    
    onArtData.push(onArtValue)
    notArtData.push(notArtValue)
    undiagnosedData.push(undiagnosedValue)
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

  const femaleXYValues = data['females'].map(d => {
    return ({
      x: Number(d.year),
      y: d.value,
    })
  })
  const maleXYValues = data['males'].map(d => {
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
    yAxis: { title: { text: 'HIV Negative Tests (thousands)' } },
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
    yAxis: { title: { text: 'HIV Positive tests (thousands)' } },
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

const getPrevalence = data => {
  const isShiny = true // TODO
  
  const { title } = CHARTS.PREVALENCE

  const options = {
    plotOptions: { series: { marker: { radius: 3 } } },
    subtitle: { text: 'Spectrum/Shiny90 model estimates (UNAIDS, 2020)' },
    plotOptions: { series: { pointStart: 2015 } }
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
  data.prevalence.forEach((yearRecord, i) => {
    // TODO: calc uci/lci
    const prevalenceValue = _.get(yearRecord, 'median.value')
    prevalenceData.push(prevalenceValue)

    const populationValue = _.get(data, ['population', i, 'value'])
    const onArtValue = _.get(data, ['onArt', i, 'value'])
    const plhivValue = _.get(data, ['plhiv', i, 'median', 'value'])

    const adjPrevValue = (
      (plhivValue - onArtValue) /
      (populationValue - onArtValue)
    )
    adjPrevData.push(adjPrevValue)
    
    if (isShiny) {
      const positivityValue = _.get(data, ['positivity', i, 'median', 'value'])
      const dYieldValue = _.get(data, ['dYield', i, 'median', 'value'])
      positivityData.push(positivityValue)
      dYieldData.push(dYieldValue)
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
      // name: 'Prevalence range',
      // shinyInclude: true,
      // data: [
      //   [39, 46], [39, 44], [38, 43], [38, 43], [37, 42],
      //   [37, 42], [37, 42], [37, 42], [36, 42], [36, 41],
      // ].map(p => p.map(n => n * .4)),
      // type: 'arearange',
      // enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      // lineWidth: 0,
      // linkedTo: ':previous',
      // color: colors[0],
      // fillOpacity: 0.2,
      // zIndex: 0,
      // marker: { enabled: false }
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
      // name: 'Positivity range',
      // data: [
      //   [1, 4], [2, 6], [2, 5], [3, 7], [5, 8],
      //   [8, 9], [8, 12], [13, 15], [14, 19], [16, 23],
      // ].reverse(),
      // type: 'arearange',
      // enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      // lineWidth: 0,
      // linkedTo: ':previous',
      // color: colors[1],
      // fillOpacity: 0.2,
      // zIndex: 0,
      // marker: { enabled: false }
    }, {
      name: 'Diagnostic yield',
      description: TERM_MAP.diagnosticYield.definition,
      zIndex: 1,
      tooltip: { pointFormat: uncertaintyTooltipFormat },
      // dashStyle: 'DashDot',
      data: dYieldData
    }, {
      // name: 'Diagnostic yield range',
      // data: dyRange,
      // type: 'arearange',
      // enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      // lineWidth: 0,
      // linkedTo: ':previous',
      // color: colors[2],
      // fillOpacity: 0.2,
      // zIndex: 0,
      // marker: { enabled: false }
    }, {
      name: 'Treatment adjusted prevalence',
      description: TERM_MAP.treatmentAdjustedPrevalence.definition,
      zIndex: 1,
      color: colors[9],
      // dashStyle: 'LongDash',
      tooltip: { pointFormat: uncertaintyTooltipFormat },
      data: adjPrevData
    }, {
      // name: 'Treatment adjusted prevalence range',
      // data: tapRange,
      // type: 'arearange',
      // enableMouseTracking: false, // tooltip formatter: find these values to add to + TT
      // lineWidth: 0,
      // linkedTo: ':previous',
      // color: colors[9],
      // fillOpacity: 0.2,
      // zIndex: 0,
      // marker: { enabled: false }
    },
  ]
  // if (!shiny) {
  //   series = series.filter(s => s.shinyInclude)
  // }
  return _.merge({}, getLine({ series, options, title, spline: false }))
}

const getAdults = data => {
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
  return _.merge({}, getColumnScat({ title, series, options, categories }))
}

const getCommunity = data => {
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
  return _.merge({}, getColumnScat({ title, series, options, categories }))
}

const getFacility = data => {
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
        pointFormat: `<span style="color:{point.color}">●</span>
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
    subtitle: {
      text: `Total tests: ${_.meanBy([
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
      ], 'y')}%`
    }
  }
  const categories = ['PITC', 'ANC', 'VCT', 'Family Planning Clinic', 'Other', 'TOTAL']
  // const options = { xAxis: { categories: ['Community', 'Facility']} }
  return _.merge({}, getColumnScat({ title, options, categories, series }))
}

const getIndex = data => {
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
  return _.merge({}, getColumnScat({ title, options, categories, series }))
}

const getForecast = data => {
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
        { x: 2020, y: 812303 },
        { x: 2021, y: 802343 },
        { x: 2022, y: 813242 },
        { x: 2023, y: 829238 },
        { x: 2024, y: 832343 },
        { x: 2025, y: 825232 }]
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
