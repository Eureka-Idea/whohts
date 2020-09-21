import React from 'react'
import './styles.css'
import Tooltip from '../Tooltip'

const KPTable = ({ config }) => {
  if (!config) {
    console.error('KP Table has no config.')
    return
  }

  const classes = 'kp-table '
  console.log(config)
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
            <td>{config.data.sw.prev}</td>
            <td>{config.data.sw.aware}</td>
            <td>{config.data.sw.year}</td>
          </tr>
          <tr>
            <th scope='row'>Gay men and other men who have sex with men</th>
            <td>{config.data.msm.prev}</td>
            <td>{config.data.msm.aware}</td>
            <td>{config.data.msm.year}</td>
          </tr>
          <tr>
            <th scope='row'>People who inject drugs</th>
            <td>{config.data.pwid.prev}</td>
            <td>{config.data.pwid.aware}</td>
            <td>{config.data.pwid.year}</td>
          </tr>
          <tr>
            <th scope='row'>Transgender people</th>
            <td>{config.data.trans.prev}</td>
            <td>{config.data.trans.aware}</td>
            <td>{config.data.trans.year}</td>
          </tr>
          <tr>
            <th scope='row'>People in prison</th>
            <td>{config.data.pris.prev}</td>
            <td>{config.data.pris.aware}</td>
            <td>{config.data.pris.year}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default KPTable