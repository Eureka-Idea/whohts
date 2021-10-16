import React, {Component} from 'react'
// import { bindActionCreators } from 'redux'
// import * as productActions from '../../actions/product'
// import { connect } from 'react-redux'
import Homepage from '../../components/Homepage'

class Home extends Component {
  render() {
    return <Homepage />
  }
}

// export default connect(
//   state => ({
//     products: state.product.products
//   }),
//   dispatch => ({
//     actions: bindActionCreators(productActions, dispatch)
//   })
// )(Home)
export default Home
