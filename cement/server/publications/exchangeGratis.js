import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {ExchangeGratis} from '../../imports/api/collections/exchangeGratis.js';
import {PayBills} from "../../imports/api/collections/payBill.js";
Meteor.publish('cement.exchangeGratis', function cementExchangeGratis(selector, options) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        return ExchangeGratis.find(selector, options);
    }

    return this.ready();
});


Meteor.publish('cement.activeExchangeGratis', function cementActiveSaleOrder(selector) {
    if (this.userId) {
        Meteor._sleepForMs(200);
        return ExchangeGratis.find(selector);
    }
    return this.ready();
});
