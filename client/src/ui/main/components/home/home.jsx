import React from 'react';
import { Layout } from 'antd';
import  { Link } from 'react-router-dom';

import ProductsHome from '../../containers/productsHome.jsx';
import SliderHome from '../../containers/sliderHome.jsx';
import BlogPosts  from '../../containers/blogPosts';
import Services from './services.jsx';
import Iframe from '../common/iframe.jsx';
import Contacto from './contacto.jsx'
import Row from 'antd/lib/row';

class Home extends React.Component {
  constructor(props){
    super(props);
  }

  componentDidMount(){
    //load twitter widget(timeline) and only scan child element of the given id
    window.twttr.widgets.load(document.getElementById("twitter-feed"));
  }
  render(){
    return(
      <div className="home-container">
        <SliderHome/>
        <div className="welcome" >
          <div className="diagonal-up"></div>
            <div className="hola">
            <div><h3>¡HOLA!</h3></div>
            <div className="spacer"></div>
            <p>
              Somos la franquicia con mayor experiencia en Depilación Láser, utilizamos el láser más vanguardista y efectivo del mercado, con los mejores resultados.
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon fill="white" points="0 0, 0 100, 100 100"/>
            </svg>
          </div>
        </div>
        <div style={{height: "125px"}}></div>
        <Row>
          <Services/>
        </Row>
        <Row> 
          <ProductsHome/>
        </Row>
        <div className="rs-feed display-block-sm">
          <BlogPosts/>
          <div id="twitter-feed" className="twitter-feed">
            <a 
              className="twitter-timeline" 
              href="https://twitter.com/KopayMX?ref_src=twsrc%5Etfw"
              data-height="450"
              data-chrome="nofooter noscrollbar"
              data-width="550"
            >
              Tweets by KopayMX
            </a>
          </div>
          <div className="iframe-wrapper" >
            <Iframe 
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FKopayMx&amp;tabs=timeline&amp;width=340&amp;height=500&amp;small_header=true&amp;adapt_container_width=true&amp;hide_cover=true&amp;show_facepile=true&amp;appId"
              style={{border:"none",overflow:"hidden"}} 
              height="450"
              scrolling="no"
              width="350"
              frameBorder="0" 
              allowTransparency="true"/>
          </div>
        </div>
        <div style={{height: "20px"}}></div>
        <Contacto/>
      </div>
  
    );

  }
}

export default Home;