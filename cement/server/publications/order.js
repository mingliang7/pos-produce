import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Order} from '../../imports/api/collections/order.js';
import {ReceivePayment} from "../../imports/api/collections/receivePayment.js";
import {SaleOrderReceivePayment} from "../../imports/api/collections/saleOrderReceivePayment.js";
Meteor.publish('cement.order', function simpleOrder(selector, options) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let orders = Order.find(selector, options);
        return orders;
    }

    return this.ready();
});

Meteor.publish('cement.receivePayment', function cementReceivePayment(selector = {}) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
    }).validate({selector});

    if (this.userId) {
        let data = ReceivePayment.find(selector);
        return data;
    }

    return this.ready();
});

Meteor.publish('cement.saleOrderReceivePayment', function saleOrderReceivePayment(selector = {}) {
    this.unblock();

    new SimpleSchema({
        selector: {type: Object, blackbox: true},
    }).validate({selector});

    if (this.userId) {
        let data = SaleOrderReceivePayment.find(selector);
        console.log(data.fetch());
        return data;
    }
    return this.ready();
});

Meteor.publish('cement.activeOrders', function cementActiveOrder(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        // options: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        let data = Order.find(selector);
        return data;
    }
    return this.ready();
});