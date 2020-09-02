import * as types from '../constants/types'
import _ from 'lodash'
import { getIndicatorMap, AGGREGATE_GETTER } from '../constants/charts'

const fields = [ // todo swap out
  'indicator',
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
  'modality_category'
]

// TODO: does this prevent cacheing? 
const myHeaders = new Headers()
myHeaders.append('pragma', 'no-cache')
myHeaders.append('cache-control', 'no-cache')
const myInit = {
  method: 'GET',
  headers: myHeaders,
}

// const chartNames = ['population']
// const chartNames = ['chart1', 'chart2', 'chart3', 'chart4']

const baseUrl = 'https://status.y-x.ch/query?'

const isShiny = true // todo

// gets records to cover the indicators relevant to each chart
export const getChartData = (country) =>
  dispatch => {
    console.log('GETCHARTDATA DISPATCH')
    // until we care about the data, avoid errors
    // return
    const indicatorMap = getIndicatorMap(isShiny)
    const allChartQueryPs = _.map(indicatorMap, (indicators, chartName) => {
      
      // return Promise.all
      const getIndicatorP = indicator => {
        let url = baseUrl
        let char = ''
        fields.forEach(f => {
          let chartValue = indicator[f]
          if (chartValue) {
            if (f === 'country_name') {
              chartValue = country
            }
            let chunk = `${char}${f}=${chartValue}`
            chunk = encodeURI(chunk)
            chunk = chunk.replace('+', '%2B') // TODO - figure out why not encoded properly
            console.log('f: ', f, ' val: ', chartValue)
            console.log('chunk: ', chunk)
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
      const allChartData = {}
      
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
            console.error('Indicator result error: ', data.error)
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
