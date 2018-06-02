import React from 'react';
import { Layout, Row, Col } from 'antd';

import SubscribeEmail from './subscribeEmail';

class FooterComp extends React.Component {
    render() {
        return (
            <Layout.Footer id="footer">
                <Row className="kopay-main-footer">
                    <Col lg={6} md={8} sm={14} xs={24} className="services">
                        <h5>SERVICIOS</h5>
                        <a href="/content/servicios#depilacion">Depilación Láser</a>
                        <a href="/content/servicios#antiedad">Tratamiento Antiedad</a>
                        <a href="/content/servicios#varices">Eliminación de Várices</a>
                        <a href="/content/servicios#venas">Eliminación de Venas Faciales</a>
                        <a href="/content/servicios#endermologie">Endermologie</a>
                        <a href="/content/servicios#therma">Thermashape</a>
                        <a href="/content/servicios#vela">Velashape</a>
                        <a href="/content/servicios#vibra">Vibrabody</a>
                    </Col>
                    <Col lg={4} md={8} sm={10} xs={24} className="privacy">
                        <h5>AVISO DE PRIVACIDAD</h5>
                        <a href="aviso">Aviso de Privacidad</a>
                    </Col>
                    <Col lg={4} md={8} sm={10} xs={24} className="brand">
                        <a className="logo-footer" href="kopay">
                            <img src="/public/img/logo-footer.png" alt="Kopay" />
                        </a>
                        <a href="tel:+528000056729">
                            <p>Para más información</p>
                            <div><span className="glyphicon glyphicon-earphone"></span><span>&nbsp;01 800 00 KOPAY</span></div>
                        </a>
                    </Col>
                    <Col lg={2} md={0} sm={0} xs={0} >
                        <div className="separator"></div>
                    </Col>
                    <Col lg={8} md={24} sm={24} xs={24} className="follow">
                        <h5>SÍGUENOS EN NUESTRAS REDES SOCIALES</h5>
                        <div className="social">
                            <a className="ant-col-4" href="http://www.facebook.com/KopayMX">
                                <i className="fa fa-facebook-official" aria-hidden="true" />
                            </a>
                            <a className="ant-col-4" href="http://twitter.com/KopayMX">
                                <i className="fa fa-twitter-square" aria-hidden="true" />
                            </a>
                            <a className="ant-col-4" href="http://www.instagram.com/kopaymx">
                                <i className="fa fa-instagram" aria-hidden="true" />
                            </a>
                        </div>
                        <SubscribeEmail label="Suscribete para recibir las ultimas promociones." />
                    </Col>
                </Row>
                <Row className="kopay-rnviz-footer">
                    <Col>
                        <h6>
                            © 2017 OPERADORA DE FRANQUICIAS KOPAY S.A. de C.V. | POWERED BY
                         <a href="http://www.rnviz.com"> RNVIZ</a>
                        </h6>
                    </Col>
                </Row>
            </Layout.Footer>
        );
    }
}

export default FooterComp;