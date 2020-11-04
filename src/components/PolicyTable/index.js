import React from 'react'
import './styles.css'

const PolicyTable = ({ config }) => {
  if (!config) {
    return
  }
  
  const classes = 'policy-table'
  return (
    <div className={classes}>
      <h2>WHO HIV Testing Policy Compliance</h2>
      <table className='table table-striped'>
        <tbody>
          {config.data.map((r,i)=> {
            
            return (
              <tr key={i}>
                <th scope='row'>{r.rowName}</th>
                <td>{r.value||'N/A'}</td>
                {/* <td><span className='marker compliant'></span></td> */}
              </tr>
            )
          })}

        </tbody>
      </table>
    </div>
  )
}

export default PolicyTable