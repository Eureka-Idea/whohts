import * as types from '../constants/types'
import _ from 'lodash'
import { getIndicatorMap, AGGREGATE_GETTER, FIELD_MAP, CHARTS, BASE_URL } from '../constants/charts'
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

const debugList = {
  // [CHARTS.PREVALENCE.id]: true,
  // [CHARTS.HIV_POSITIVE.id]: true,
  // [CHARTS.HIV_NEGATIVE.id]: true,
  // [CHARTS.PLHIV_DIAGNOSIS.id]: true,
  // [CHARTS.FACILITY.id]: true,
  // [CHARTS.CONTEXT.id]: true,
  // [CHARTS.P95.id]: true,
  
  [CHARTS.GROUPS_TABLE.id]: true,
  [CHARTS.POLICY_TABLE.id]: true,
  [CHARTS.KP_TABLE.id]: true,

  // [CHARTS.ADULTS.id]: true,
  // [CHARTS.COMMUNITY.id]: true,
  // [CHARTS.FORECAST.id]: true,
  // [CHARTS.INDEX.id]: true,

  // [CHARTS.PLHIV_AGE.id]: true,
  // [CHARTS.PLHIV_SEX.id]: true,
}
const debugSkipList = {
  // [CHARTS.FORECAST.id]: true,
}

// gets records to cover the indicators relevant to each chart
export const getChartData = (countryCode) =>
  dispatch => {
    const isShiny = _.get(COUNTRY_MAP, [countryCode, 'shiny'], false)
    let indicatorMap = getIndicatorMap(isShiny)

    if (!_.isEmpty(DEV && debugList)) {
      indicatorMap = _.pickBy(indicatorMap, (v, k) => debugList[k])
    } else if (!_.isEmpty(DEV && debugSkipList)) {
      indicatorMap = _.pickBy(indicatorMap, (v, k) => !debugList[k])
    }
    
    const allChartQueryPs = _.map(indicatorMap, (indicators, chartName) => {
    
      const getIndicatorP = indicator => {
        let url = BASE_URL
        let char = ''
        _.each(FIELD_MAP, f => {
          let chartValue = indicator[f]
          if (chartValue) {
            if (f === FIELD_MAP.COUNTRY_ISO_CODE) {
              chartValue = countryCode
            }
            let chunk = `${char}${f}=${chartValue}`
            chunk = encodeURI(chunk)
            chunk = chunk.replace('+', '%2B') // TODO - figure out why not encoded properly
            // console.log('f: ', f, ' val: ', chartValue)
            // console.log('chunk: ', chunk)
            url += chunk
            char = '&'
          }
        })
        
        // console.log('GETCHARTDATA FETCH')
        return fetch(url, myInit)
        .then(r => {
          // console.log('now json')
          return r.json()
        })
        .then(data => {
          // console.log('data for: ', chartName)
          return ({ chartName, data, id: indicator.id, getter: indicator.getter })
        })
        .catch(e => {
          console.error('DATA FETCH FAILED FOR ', chartName, ' : ', e)
        })
      }

      return Promise.all(_.map(indicators, getIndicatorP))
    })

    // console.log('all promises...')
    Promise.all(allChartQueryPs)
    .then(chartsResults => {
      // console.log('...gave chartsResults')
      const allChartData = { countryCode }
      
      chartsResults.forEach(chartResults => {
        // const chartName = _.get(chartResults, '0.chartName')
        // allChartData[chartName] = { data: {}, errors: {} }
        
        chartResults.forEach(indicatorResult => {

          // TODO: remove
          if (!indicatorResult) {
            console.error('No indicator for: ', id, chartName)
            // debugger
            return
          }
          
          const { chartName, data, id, getter } = indicatorResult

          if (data.error) {
            console.error(`Indicator result error for [${id}] of chart [${chartName}]: ${data.error}`)
            _.set(allChartData, [chartName, 'errors', id], data.error)
            return
          }
          
          const chosenData = getter(data)
          // console.log('adding result for: ', chartName)
          // console.log('which is: ', chosenData)

          if (id === AGGREGATE_GETTER) {
            _.set(allChartData, [chartName, 'data'], chosenData)
          } else {
            _.set(allChartData, [chartName, 'data', id], chosenData)
          }
        })
        
      })
      
      // console.log('GETCHARTDATA COMPLETE')
      dispatch({
        type: types.FETCH_CHART_DATA,
        payload: allChartData
      })
    })
    .catch(e => {
      console.error('DATA FETCH FAILED.', e)
    })
  }
