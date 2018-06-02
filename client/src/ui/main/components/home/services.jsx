import React from 'react';
import { Link } from 'react-router-dom';

const Services =({})=>{
  return(
    <div className="container-services">
          <div className="trans" >
            <div className="wrapper">
              <div className="col-left">
                <div className="ro-service-1-item">
                  <div className="image left">
                    <img src='/public/img/service1.jpg' className="img-responsive no-display-xs"/>
                  </div>
                  <div className="service-description right xs-100">
                    <Link to="/servicios#depilacion">
                      <h3 className="service-heading">Depilación <br/> Laser </h3>
                      <div className="spacer spacer-black"></div>
                      <p className="service-text bg-yellow">Contamos con las sesiones más rápidas y efectivas gracias al equipo LÁSER que utilizamos.</p>
                    </Link>
                  </div>
                </div>
                <div className="ro-service-1-item">
                  <div className="service-description left xs-100">
                    <Link to="/servicios#antiedad">
                      <h3 className="service-heading">Tratamiento <br/> Antiedad </h3>
                      <div className="spacer spacer-black"></div>
                      <p className="service-text bg-blue">Luce una piel más suave, lisa, luminosa y resplandeciente.</p>
                    </Link>
                  </div>
                  <div className="image left">
                    <img src='/public/img/service2.jpg' className="img-responsive no-display-xs"/>
                  </div>
                </div>
              </div>
              <div className="col-right" >
              <div className="ro-service-1-item">
                  <div className="image-right without-padding medium-screen-image">
                    <img src='/public/img/service3.jpg' className="img-responsive no-display-xs"/>
                  </div>
                  <div className="description-100 xs-100 medium-screen-description description-xs">
                    <Link to="/servicios#varices">
                      <div className="heading-left column-right-services ">
                        <h3 className="service-heading">Eliminación de Várices </h3>
                        <div className="spacer spacer-black"></div>
                      </div>
                      <p className="service-text bg-rose text-right column-right-services">Elimina por completo las várices de tu cara y cuerpo que representen un problema estético. <br/>  Ahora es muy sencillo gracias a Kopay</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}

export default Services;