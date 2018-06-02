import React from 'react';
import { Link } from 'react-router-dom';
import { Icon }  from 'antd';
import Iframe from '../common/iframe.jsx';

const franBottomImage = '../../../../public/img/franquicia2.jpg';

const franBottomStyle = {
  backgroundImage: `url(${franBottomImage})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  height: '450px'
}

class Nosotros extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    return(
      <div className="container-nosotros">
        <div className="header" >
          <h3>¿QUIÉNES SOMOS?</h3>
          <div className="spacer spacer-black"></div>
        </div>
        <div>
          <p className="somos">
            La franquicia con mayor experiencia en Depilación Láser, utilizamos el LÁSER más vanguardista y efectivo del mercado, con los mejores resultados.
            <br/>
            Contamos con más de 11 años de experiencia, 20 sucursales alrededor de la República Mexicana, terapeutas certificadas y altos estándares de calidad.
            <br/>
            Ven y siente todos los beneficios de ser cliente KOPAY.
          </p>
        </div>
        <div>
          <div className="lg-50 col-left" >
            <div className="card" >
              <h3>Misión</h3>
              <p className="text" >
                Brindar un excelente servicio a nuestros clientes, garantizando los mejores resultados a través de la más avanzada tecnología buscando siempre estar a la vanguardia en equipos y tratamientos estéticos.
              </p>
              <img src='/public/img/service21.jpg' alt="mission-image" className="img-responsive"/>
            </div>
            </div>
          <div className="lg-50 col-right" >
            <div className="card">
              <h3>Visión</h3>
              <p className="text" >
              Ser una empresa moderna que llegue a crear una imagen distintiva por la calidad en sus servicios de tratamientos de belleza y por su excelente atención al cliente, así como ofrecer una fuente de trabajo sólida y prestigiada en donde la gente se sienta orgullosa de trabajar y aportar su esfuerzo y capacidad.
              </p>
              <img src='/public/img/service22.jpg' alt="vision-image" className="img-responsive" />
            </div>
          </div>
        </div>
        <div>
        <Iframe 
          width="90%" 
          height="500" 
          src="https://www.youtube.com/embed/YHpNKjsQadE" 
          frameBorder="0" 
          allow="autoplay; encrypted-media" 
          allowFullscreen/>
        </div>
        <div className="container-franquicia">
          <div className="franquicia-wrapper" >
            <div className="franquicia-flex" >
              <div className="franquicia" >
                <div className="franquicia-header" >
                  <h3>FRANQUICIA</h3>
                  <div className="spacer" ></div>
                </div>
                <p className="franquicia-text">
                  Forma parte de la red de Franquicias con mayor experiencia en Depilación Láser.
                  <br/>
                  En Kopay nos caracterizamos por ser una empresa competitiva en el mercado de servicios con láser.
                  <br/>
                  La base de nuestro éxito es la orientación al servicio, satisfacción al cliente y apoyo constante a nuestros franquiciatarios.
                  <br/>
                  Estamos convencidos de que su éxito en nuestro éxito. 
                </p>
              </div>
            </div>
            <div className="logo-flex less-lg-display-no">
              <img src='/public/img/logo-footer.png' alt="logo-footer" className="img-responsive" />
            </div>
          </div>          
        </div>
        <div className="nosotros-bottom"  style={franBottomStyle}>
          <div className="nostros-bottom">
          <div className="nosotros-bottom-box lg-nosotros-bottom less-lg-nostros-box" >
            <div className="nosotros-bottom-text">
              <p>
                Kopay es un centro de belleza donde se aplican tratamientos con la más alta tecnología tales como: 
              </p>
              <ul>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#depilacion">Depilación Láser</Link>
                </li>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#antiedad">Tratamiento Antiedad</Link>
                </li>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#varices">Eliminación de Varices y Venas Faciales</Link>
                </li>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#endormologie">Tratamiento Anti-celulitis y Grasas Localizadas</Link>
                </li>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#vela">Velashape</Link>
                </li>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#therma">Thermashape</Link>
                </li>
                <li>
                  <Icon type="right"/>
                  <Link to="servicios#vibra">Vibrabody</Link>
                </li> 
              </ul>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Nosotros;