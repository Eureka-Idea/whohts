import * as types from '../constants/types'
import _ from 'lodash'
import { NEW_ENDPOINT } from '../constants/charts'

// TODO: does this prevent cacheing?
// ALSO avoid options request https://stackoverflow.com/questions/1256593/why-am-i-getting-an-options-request-instead-of-a-get-request
const myHeaders = new Headers()
myHeaders.append('pragma', 'no-cache')
myHeaders.append('cache-control', 'no-cache')
const myInit = {
  method: 'GET',
  // headers: myHeaders,
}

function convertNumericKeyedObjectsToArrays(obj, key) {
  if (Array.isArray(obj)) {
    return obj.map(convertNumericKeyedObjectsToArrays)
  } else if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.every((k) => /^\d+$/.test(k))) {
      const sorted = keys.map(Number).sort((a, b) => a - b)
      if (sorted.every((k, i) => k === i)) {
        return sorted.map((k) => convertNumericKeyedObjectsToArrays(obj[k]))
      }
    }
    return Object.fromEntries(
      keys.map((k) => [k, convertNumericKeyedObjectsToArrays(obj[k], k)])
    )
  }
  // console.log({ obj, key })
  // convert all numeric "value" values to numbers
  if (key === 'value' && !Number.isNaN(parseFloat(obj))) return parseFloat(obj)
  return obj
}

const DEV = window.location.hostname === 'localhost'
if (!DEV) {
  console.log = _.noop
  console.warn = _.noop
  console.error = _.noop
}

// gets records to cover the indicators relevant to each chart
export const getChartData = (countryCode) => (dispatch) => {
  const newEndpoint = NEW_ENDPOINT + countryCode
  fetch(newEndpoint, myInit)
    .then((r) => {
      console.log('!!!! ', r)
      return r.json()
    })
    .then((d) => {
      // const data = convertNumericKeyedObjectsToArrays(d)
      // const data = convertNumericKeyedObjectsToArrays(d)
      // console.log({ newEndpoint, data, d })
      dispatch({
        type: types.FETCH_CHART_DATA,
        payload: [[], d],
        // todoXXX: needed?
        // payload: [[], data],
      })
    })
    .catch((e) => {
      if (DEV) {
        console.error('DATA FETCH FAILED FOR ', newEndpoint, ' : ', e)
      }
    })
}
