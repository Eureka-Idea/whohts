import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import Dashboard from '../Dashboard'
import {Compare, ProductList} from '../../components'
import * as productActions from '../../actions/product'
import {connect} from 'react-redux'
import Homepage from '../../components/Homepage'

class Home extends Component {
  render() {
    return (
      <Homepage />
    )
  }
}

export default connect(
  state => ({
    products: state.product.products
  }),
  dispatch => ({
    actions: bindActionCreators(productActions, dispatch)
  })
)(Home)

/* <ProductList products={products} compare={actions.compare}/>
{compareProducts.length >= 2 &&
  <Compare products={compareProducts}/>
} */
