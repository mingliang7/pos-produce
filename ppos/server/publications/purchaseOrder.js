import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment.js';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';

Meteor.publish('ppos.purchaseOrder', function cementPurchaseOrder(selector, options) {
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

Meteor.publish('ppos.activePurchaseOrder', function activePurchaseOrder(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true}
    }).validate({selector});
    if (this.userId) {
        Meteor._sleepForMs(200);
        selector.sumRemainQty = {
            $gt: 0
        };
        let data = PurchaseOrder.find(selector);
        console.log(data.fetch());
        return data;
    }
    return this.ready();
});