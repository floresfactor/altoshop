import React from 'react';
import PropTypes from 'prop-types';

import { currencyFormat } from '../../../../lib/util/formatUtils';
import '../../../../styles/oxxo-stub.less';

const OxxoStub = ({ total, reference, showInstructions }) => {
    return (
        <div className="oxxo-stub">
            <div className="opps">
                <div className="opps-header">
                    <div className="opps-reminder">Ficha digital. No es necesario imprimir.</div>
                    <div className="opps-info">
                        <div className="opps-brand"><img src="public/img/oxxopay_brand.png" alt="OXXOPay" /></div>
                        <div className="opps-ammount">
                            <h3>Monto a pagar</h3>
                            <h2>{currencyFormat(total || 0)} <sup>MXN</sup></h2>
                            {showInstructions && <p>OXXO cobrará una comisión adicional al momento de realizar el pago.</p>}
                        </div>
                    </div>
                    <div className="opps-reference">
                        <h3>Referencia</h3>
                        <h1>{reference || '0000-0000-0000-00'}</h1>
                    </div>
                </div>
               {showInstructions && <div className="opps-instructions">
                    <h3>Instrucciones</h3>
                    <ol>
                        <li>Acude a la tienda OXXO más cercana. <a href="https://www.google.com.mx/maps/search/oxxo/" target="_blank">Encuéntrala aquí</a>.</li>
                        <li>Indica en caja que quieres ralizar un pago de <strong>OXXOPay</strong>.</li>
                        <li>Dicta al cajero el número de referencia en esta ficha para que tecleé directamete en la pantalla de venta.</li>
                        <li>Realiza el pago correspondiente con dinero en efectivo.</li>
                        <li>Al confirmar tu pago, el cajero te entregará un comprobante impreso. <strong>En el podrás verificar que se haya realizado correctamente.</strong> Conserva este comprobante de pago.</li>
                    </ol>
                    <div className="opps-footnote">Al completar estos pasos recibirás un correo de <strong>Kopay</strong> confirmando tu pago.</div>
                </div>}
            </div>
        </div>
    );
};

OxxoStub.propTypes = {
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    reference: PropTypes.string,
    showInstructions: PropTypes.bool
};

export default OxxoStub;
