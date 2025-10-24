import * as types from '../constants/types'

const INITIAL_STATE = {
  chartData: [],
  chartDataAPI: [],
}

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case types.FETCH_CHART_DATA:
      console.log('XXX FETCH CHART PAYLOAD: XXX ', action.payload)
      return {
        ...state,
        // chartData: action.payload[0],
        chartData: action.payload[1],
      }
    default:
      return state
  }
}
