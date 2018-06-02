import  React  from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Carousel } from 'react-responsive-carousel';
import { loadSliderItems } from '../../../actions/adminSliderItemsActions';
import resources from '../../../lib/constants/resources';

const settings = {
      showArrows: false,
      showStatus: false,
      showThumbs: false,
      autoPlay: true,
      showIndicators: false,
      infiniteLoop: true,
      dynamicHeight: true,
      stopOnHover: false,
      interval: 3000
}; 

class SliderHome extends React.Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.state = { 
        sliderItems: [
    ]};
  }

  componentDidMount(){
    this.props.loadSliderItems();
  }

  render(){

    return(
        <Carousel {...settings}>
        {this.props.sliderItems && this.props.sliderItems.length && 
          this.props.sliderItems.map((item)=>{
              return (<Link  key={item._id} to={item.productGroup ? item.productGroup.link : '/'}>
                        <div className="image-slider">
                          <img src={ item.image ? item.image.src : resources.IMG_NO_IMG_URL } alt="sliderItem"/>
                        </div>
                      </Link>)
          })
        }
        </Carousel>
    
    );
  }
};

SliderHome.proptypes = {
   sliderItems: PropTypes.array.isRequired,
   loadSliderItems: PropTypes.func.isRequired
}

const mapStateToProps = state =>{
  return {
    sliderItems: state.sliderItems
  }
}

const mapDispatchToProps = (dispatch) =>{
  return{
    loadSliderItems: sliderItems =>{
      return dispatch(loadSliderItems(sliderItems));
    }
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(SliderHome);