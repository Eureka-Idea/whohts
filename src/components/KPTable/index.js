import React from 'react'
import ReactTooltip from 'react-tooltip'
import './styles.css'
import Tooltip from '../Tooltip'
import { FIELD_MAP, SOURCE_DISPLAY_MAP } from '../../constants/charts'
import { displayPercent, displayNumber } from '../../containers/Dashboard/chartConfigs'
import _ from 'lodash'

const dems = {
  sw: 'Sex workers',
  msm: 'Gay men and other men who have sex with men',
  pwid: 'People who inject drugs',
  trans: 'Transgender people',
  pris: 'People in prison',
}

const KPTable = ({ config, iso }) => {
  if (!config) {
    console.error('KP Table has no config.')
    return
  }
  
  const getTd = (row, dem, ind) => {
    const uid = `${dem}-${ind}-${iso}`
    
    const {
      [FIELD_MAP.VALUE]: v,
      [FIELD_MAP.SOURCE_DATABASE]: source,
      [FIELD_MAP.YEAR]: year,
      noData
    } = row

    const tooltipId = 'tooltip-' + uid
    let val
    let tooltip = (
      <ReactTooltip id={tooltipId} className='td-tooltip' type='dark' effect='solid'>
        <div>Source: {SOURCE_DISPLAY_MAP[source] || source}</div>
        <div>Year: {year}</div>
      </ReactTooltip>
    )
    
    if (!v || noData) {
      val = 'N/A'
      tooltip = null
    } else if (ind === 'year') {
      // year is programme data, no rounding
      val = displayNumber({ v, unrounded: true })
    } else {
      // prevalence gets a decimal place, aware doesn't
      val = displayPercent({ v, decimals: ind === 'prev' ? 1 : 0 })
    }


    return (
      <td>
        <a data-tip data-for={tooltipId}>{val}</a>
        {tooltip}
      </td>
    )
  }
  
  return (
    <div className='kp-table' key={iso}>
      <h2>Key Populations</h2>
      <Tooltip className='table-tooltip'>
        <div>
          Data from multiple sources and time periods. Hover a data value for more information.
        </div>
      </Tooltip>
      <table className='table table-striped table-responsive table-responsive-lg'>
        <thead>
          <tr>
            <th scope='col'></th>
            <th scope='col'>HIV prevalence (%)</th>
            <th scope='col'>HIV testing and status awareness</th>
            <th scope='col'>Tested in past year</th>
          </tr>
        </thead>
        <tbody>
          {_.map(dems, (name, id) => {
            return (
              <tr key={id}>
                <th scope='row'>{name}</th>
                { getTd(config.data[id].prev, id, 'prev') }
                { getTd(config.data[id].aware, id, 'aware') }
                { getTd(config.data[id].year, id, 'year') }
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default KPTable