import numeral from 'numeral';
import toastr from 'toastr';
import jquery from 'jquery';
import moment from 'moment/moment';
import _ from 'lodash';

// Set global objects
window.$ = jquery;
window._ = _;
window.moment = moment;

// 'finally' shim for promises
require('promise.prototype.finally').shim();

// Default number format for currency
numeral.defaultFormat('$0,0.00');

// Toastr options
toastr.options.preventDuplicates = true;

// moment options
moment.locale('es-MX');

try {
    // Conekta public key
    Conekta.setPublishableKey('key_IE4FuPepRuWu1q2FRVbTwFQ');
}
catch(e){}
