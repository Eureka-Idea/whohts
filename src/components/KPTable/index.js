import React from 'react'
import './styles.css'
import Tooltip from '../Tooltip'
import { FIELD_MAP, SOURCE_DISPLAY_MAP } from '../../constants/charts'
import { displayPercent, displayNumber } from '../../containers/Dashboard/chartConfigs'
import ReactTooltip from 'react-tooltip'

const KPTable = ({ config }) => {
  if (!config) {
    console.error('KP Table has no config.')
    return
  }

  const classes = 'kp-table '
  console.log(config)
  
  const getTd = (row, dem, ind) => {
    const uid = `${dem}-${ind}`

    const {
      [FIELD_MAP.VALUE]: value,
      [FIELD_MAP.VALUE_UPPER]: valueUpper,
      [FIELD_MAP.VALUE_LOWER]: valueLower,
      [FIELD_MAP.SOURCE_DATABASE]: source,
      [FIELD_MAP.YEAR]: year,
      noData
    } = row

    const tooltipId = 'tooltip-' + uid
    let val, dispValueUpper, dispValueLower, tooltipValueUpper, tooltipValueLower
    if (!value || noData) {
      val = <span>N/A</span>
    } else if (ind === 'year') {
      dispValueUpper = displayNumber({ v: valueUpper })
      tooltipValueUpper = !dispValueUpper ? null : 
        <div>Upper bound: {dispValueUpper}</div>

      dispValueLower = displayNumber({ v: valueLower })
      tooltipValueLower = !dispValueUpper ? null : 
        <div>Upper bound: {dispValueUpper}</div>

      val = <a data-tip data-for={tooltipId}>{displayNumber({ v: value })}</a>
    } else {
      dispValueUpper = displayPercent({ v: valueUpper })
      tooltipValueUpper = !dispValueUpper ? null : 
        <div>Upper bound: {dispValueUpper}</div>

      dispValueLower = displayPercent({ v: valueLower })
      tooltipValueLower = !dispValueLower ? null : 
        <div>Lower bound: {dispValueLower}</div>

      val = <a data-tip data-for={tooltipId}>{displayPercent({ v: value })}</a>
    }

    const tooltip = (
      <ReactTooltip id={tooltipId} className='td-tooltip' type='info' effect='solid'>
        {tooltipValueUpper}
        {tooltipValueLower}
        <div>Source: {SOURCE_DISPLAY_MAP [source] || source}</div>
        <div>Year: {year}</div>
      </ReactTooltip>
    )

    return (
      <td>{val}{tooltip}</td>
    )
  }
  
  return (
    <div className={classes}>
      <h2>Key Populations</h2>
      <Tooltip className='table-tooltip'>
        <div>
          Data from multiple sources and time periods. Hover a data value for more information.
        </div>
      </Tooltip>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th scope='col'></th>
            <th scope='col'>HIV prevalence</th>
            <th scope='col'>HIV testing and status awareness</th>
            <th scope='col'>Tested in past year</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope='row'>Sex workers</th>
            {getTd(config.data.sw.prev, 'sw', 'prev')}
            {getTd(config.data.sw.aware, 'sw', 'aware')}
            {getTd(config.data.sw.year, 'sw', 'year')}
          </tr>
          <tr>
            <th scope='row'>Gay men and other men who have sex with men</th>
            {getTd(config.data.msm.prev, 'msm', 'prev')}
            {getTd(config.data.msm.aware, 'msm', 'aware')}
            {getTd(config.data.msm.year, 'msm', 'year')}
          </tr>
          <tr>
            <th scope='row'>People who inject drugs</th>
            {getTd(config.data.pwid.prev, 'pwid', 'prev')}
            {getTd(config.data.pwid.aware, 'pwid', 'aware')}
            {getTd(config.data.pwid.year, 'pwid', 'year')}
          </tr>
          <tr>
            <th scope='row'>Transgender people</th>
            {getTd(config.data.trans.prev, 'trans', 'prev')}
            {getTd(config.data.trans.aware, 'trans', 'aware')}
            {getTd(config.data.trans.year, 'trans', 'year')}
          </tr>
          <tr>
            <th scope='row'>People in prison</th>
            {getTd(config.data.pris.prev, 'pris', 'prev')}
            {getTd(config.data.pris.aware, 'pris', 'aware')}
            {getTd(config.data.pris.year, 'pris', 'year')}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default KPTable