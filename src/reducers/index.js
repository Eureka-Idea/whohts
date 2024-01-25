import { combineReducers } from 'redux'
import chart from './chartReducer'

const chartApp = combineReducers({
  chart,
})

export default chartApp
