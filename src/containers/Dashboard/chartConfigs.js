import colors, {femaleColor, maleColor } from "./colors"
import _ from 'lodash'
import { getArea, getColumn, getLine, getColumnScat, getColumnLine } from './genericConfigs'
import { CHARTS } from "../../constants/charts";
import { TERM_MAP } from "../../constants/glossary";

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

  const retests = data['retests_total'] || Array(5).fill(null)
  const retestsValues = retests.map(d => {
    return _.get(d, 'median.value')
  })
  const firsts = data['tests_first'] || Array(5).fill(null)
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

  const [art, aware, first] = ['retests_art', 'retests_aware', 'tests_first'].map(ind => {
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
  
}

const getAdults = data => {
  
}

const getCommunity = data => {
  
}

const getFacility = data => {
  
}

const getIndex = data => {
  
}

const getForecast = data => {
  
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
