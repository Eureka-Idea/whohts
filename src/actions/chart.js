import * as types from '../constants/types'
import { FEATURE_FLAGS } from '../constants/flags'
import _ from 'lodash'
import {
  getIndicatorMap,
  AGGREGATE_GETTER,
  FIELD_MAP,
  CHARTS,
  BASE_URL,
} from '../constants/charts'
import { COUNTRY_MAP } from '../components/Homepage/countries'

// TODO: does this prevent cacheing?
// ALSO avoid options request https://stackoverflow.com/questions/1256593/why-am-i-getting-an-options-request-instead-of-a-get-request
const myHeaders = new Headers()
myHeaders.append('pragma', 'no-cache')
myHeaders.append('cache-control', 'no-cache')
const myInit = {
  method: 'GET',
  // headers: myHeaders,
}

const DEV = window.location.hostname === 'localhost'
if (!DEV) {
  console.log = _.noop
  console.warn = _.noop
  console.error = _.noop
}

// NOTE: exclusively for dev use, if any charts are marked true only those will appear on dashboard
// (speeds load time and narrows code scope when debugging)
const debugList = {
  // [CHARTS.P95.id]: true,
  // [CHARTS.CONTEXT.id]: true,
  // [CHARTS.PLHIV_DIAGNOSIS.id]: true,
  // [CHARTS.PREVALENCE.id]: true,
  // [CHARTS.HIV_POSITIVE.id]: true,
  // [CHARTS.HIV_NEGATIVE.id]: true,
  // [CHARTS.GROUPS_TABLE.id]: true,
  // [CHARTS.POLICY_TABLE.id]: true,
  // [CHARTS.KP_TABLE.id]: true,
  // [CHARTS.ADULTS.id]: true,
  // [CHARTS.COMMUNITY.id]: true,
  // [CHARTS.FACILITY.id]: true,
  // [CHARTS.FORECAST.id]: true,
  // [CHARTS.INDEX.id]: true,
  // [CHARTS.PLHIV_AGE.id]: true,
  // [CHARTS.PLHIV_SEX.id]: true,
}
// like the above, but to mark charts to omit
const debugSkipList = {
  // [CHARTS.FORECAST.id]: true,
}

// gets records to cover the indicators relevant to each chart
export const getChartData = (countryCode) => (dispatch) => {
  const isShiny = _.get(COUNTRY_MAP, [countryCode, 'shiny'], false)
  let indicatorMap = getIndicatorMap(isShiny)

  if (DEV && !_.isEmpty(debugList)) {
    indicatorMap = _.pickBy(indicatorMap, (v, k) => debugList[k])
  } else if (DEV && !_.isEmpty(debugSkipList)) {
    indicatorMap = _.pickBy(indicatorMap, (v, k) => !debugList[k])
  }

  const allChartQueryPs = _.map(indicatorMap, (indicators, chartName) => {
    const getIndicatorP = (indicator) => {
      let url = BASE_URL
      let char = ''
      _.each(FIELD_MAP, (f) => {
        let chartValue = indicator[f]

        if (f === FIELD_MAP.VALUE_COMMENT) {
          // unless we want a specific value comment, every query should request non-suppressed data values
          chartValue = chartValue || '‼️suppressed'
        }

        if (f === FIELD_MAP.AREA_NAME) {
          // SUMFIX: search for ALL (no constrained AREA_NAME) iff sumFixing
          if (chartValue === 'NULL_OR_ALL') {
            const countryApplies = _.get(
              COUNTRY_MAP,
              [countryCode, 'sumFix'],
              false
            )
            if (FEATURE_FLAGS.SHINY_SUM && countryApplies) {
              chartValue = undefined // DON'T LIMIT BY 'NULL' AREA_NAME
            } else {
              chartValue = 'NULL' // OVERWRITE 'NULL_OR_ALL'
            }
          } else if (indicator[FIELD_MAP.INDICATOR !== 'Income Group']) {
            // unless we want a specific area name, every query should request national-level data
            // Income Group rows lists region (Sub-Saharan Africa) for area name, so skip those
            chartValue = chartValue || 'NULL'
          }
        }

        if (chartValue) {
          if (f === FIELD_MAP.COUNTRY_ISO_CODE) {
            chartValue = countryCode
          }
          let chunk = `${char}${f}=${chartValue}`
          chunk = encodeURI(chunk)
          chunk = chunk.replace('+', '%2B') // TODO - figure out why not encoded properly
          url += chunk
          char = '&'
        }
      })

      return fetch(url, myInit)
        .then((r) => {
          return r.json()
        })
        .then((data) => {
          return { chartName, data, id: indicator.id, getter: indicator.getter }
        })
        .catch((e) => {
          if (DEV) {
            console.error('DATA FETCH FAILED FOR ', chartName, ' : ', e)
          }
        })
    }

    return Promise.all(_.map(indicators, getIndicatorP))
  })

  Promise.all(allChartQueryPs)
    .then((chartsResults) => {
      const allChartData = { countryCode }

      chartsResults.forEach((chartResults) => {
        // const chartName = _.get(chartResults, '0.chartName')
        // allChartData[chartName] = { data: {}, errors: {} }

        chartResults.forEach((indicatorResult) => {
          // TODO: remove
          if (!indicatorResult) {
            if (DEV) {
              console.error('No indicator for: ', id, chartName)
            }
            return
          }

          const { chartName, data, id, getter } = indicatorResult

          if (data.error) {
            if (DEV) {
              console.error(
                `Indicator result error for [${id}] of chart [${chartName}]: ${data.error}`
              )
            }
            _.set(allChartData, [chartName, 'errors', id], data.error)
            return
          }

          const chosenData = getter(data)

          if (id === AGGREGATE_GETTER) {
            _.set(allChartData, [chartName, 'data'], chosenData)
          } else {
            _.set(allChartData, [chartName, 'data', id], chosenData)
          }
        })
      })

      dispatch({
        type: types.FETCH_CHART_DATA,
        payload: allChartData,
      })
    })
    .catch((e) => {
      if (DEV) {
        console.error('DATA FETCH FAILED.', e)
      }
    })
}
