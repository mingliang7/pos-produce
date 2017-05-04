import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {PrepaidOrders} from '../../imports/api/collections/prepaidOrder.js';
import {PayBills} from "../../imports/api/collections/payBill.js";
Meteor.publish('ppos.prepaidOrder', function cementPrepaidOrder(selector, options) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let prepaidOrders = PrepaidOrders.find(selector, options);
        return prepaidOrders;
    }

    return this.ready();
});


Meteor.publish('ppos.activePrepaidOrder', function cementActiveSaleOrder(selector) {
    if (this.userId) {
        Meteor._sleepForMs(200);
        let prepaidOrders = PrepaidOrders.find(selector);
        return prepaidOrders;
    }
    return this.ready();
});
