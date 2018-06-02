import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import resources from '../../../lib/constants/resources.js';
import { currencyFormat } from '../../../lib/util/formatUtils';
//actions
import { getRandomProducts } from '../../../actions/displayItemsActions.js';

const styleCard = 
  { display: "block",
    //maxWidth: "270px",
    backgroundColor: "#fff",
    paddingTop: "15px",
    textAlign: "center",
    color: 'rgb(68,68,68)'};
const styleh5=
  { fontWeight: "700",
    letterSpacing: ".1em",
    fontSize: "16px"}

const ProductCard =({ link, h5,imgSrc, price, numSesions, name })=>{
  return(
    <div>
      <Link to={link}>
        <div style={styleCard}>
          <h5 style={styleh5}>{h5.toUpperCase()}</h5>
          <div style={{position:"relative", width:"100%"}}>
            <div className="home-product-image" style={
              { backgroundImage: imgSrc ? `url(${imgSrc})`:`url(${resources.IMG_NO_IMG_URL})`,
                width:"100%",
                minHeight: "160px",
                backgroundSize:'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat'}}>
              <div className="price-product-card">
                <h2>
                  {name}
                </h2>
                <h1>{price}</h1>
              </div>
            </div>
          </div>
          <div style={
            { fontSize: "12px",
              display: "inline-block",
              marginTop: "10px",
              borderBottom:"solid 1px #f38708", 
              marginBottom: "25px"}}>AGENDAR CITA</div>
        </div>
      </Link>
    </div>
  );
}

class ProductsHome extends React.Component {
  constructor(props){
    super(props);
    this.state ={
      products: []
    }
    this.getProduct = this.getProduct.bind(this);
  }

  componentWillMount(){
    const options = {
      count: 8,
      filterBy: {
          name: "^Paquete",
          enabled: true
      }
    };
    this.props.getRandomProducts(options).then(products => {
      this.setState({ products });
    });
  }

  getProduct(displayItem){
    let prod = displayItem.item.products.find(p => p.name == '6 Sesiones');
    return prod || displayItem.item.products[0];
  }

  render(){
    return(
      <div className="products-home-container">
          <div className="diagonal-up"></div>
          <div className="hola">
            <div><h3>LIBÉRATE</h3></div>
            <div className="spacer"></div>
            <div className="grid-sm grid-md grid-lg" style={
                { display: "grid", 
                  gridAutoFlow: 'row',
                  gridColumnGap:'4%',
                  gridRowGap: '40px',
                  padding: '0% 5% 35px 5%'}}>
              {this.state.products && this.state.products.length && 
                  this.state.products.map((prod,i)=>{
                    //const productPrices = prod.itemType == 'productGroup' ? prod.item.products.map(p => p.price) : null;
                    const product = this.getProduct(prod);
                    return( <ProductCard 
                      key={i} 
                      h5={prod.item.name} 
                      link={ `/products/${prod.itemSku}` }
                      imgSrc={prod.item.image.src} 
                      price={currencyFormat(product.price)}
                      name={product.name}
                    />
                    )
                  })
                }
            </div>
          </div>
      </div>
    );
  }
}

ProductsHome.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  getRandomProducts: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
      getRandomProducts: (options) => {
          return dispatch(getRandomProducts(options));
      }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ProductsHome);