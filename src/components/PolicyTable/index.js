import React from 'react'
import './styles.css'
import ReactTooltip from 'react-tooltip'

const PolicyTable = ({ config }) => {
  if (!config) {
    return
  }

  const classes = 'policy-table'
  return (
    <div className={classes}>
      <h2>WHO HIV Testing Policy Compliance</h2>
      <table className="table table-striped">
        <tbody>
          {config.data.map((r, i) => {
            const tooltipId = 'tooltip-' + i
            const showTooltip = r.value && r.year
            console.log({ r, showTooltip })
            const tooltip = !showTooltip ? null : (
              <ReactTooltip
                id={tooltipId}
                className="td-tooltip"
                type="dark"
                effect="solid"
              >
                <div>Year: {r.year}</div>
              </ReactTooltip>
            )

            return (
              <tr key={i}>
                <th scope="row">{r.rowName}</th>
                <td>
                  <a data-tip data-for={tooltipId}>
                    {r.value || 'N/A'}
                  </a>
                  {tooltip}
                </td>
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