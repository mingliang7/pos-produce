import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment.js';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';

Meteor.publish('cement.purchaseOrder', function cementPurchaseOrder(selector, options) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
        options: {type: Object, blackbox: true}
    }).validate({selector, options});

    if (this.userId) {
        let data = PurchaseOrder.find(selector, options);
        return data;
    }
    return this.ready();
});

Meteor.publish('cement.activePurchaseOrder', function activePurchaseOrder(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        Meteor._sleepForMs(200);
        let data = PurchaseOrder.find(selector);
        return data;
    }
    return this.ready();
});