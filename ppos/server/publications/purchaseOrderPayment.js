import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment'
Meteor.publish('ppos.purchaseOrderPayment', function activePurchaseOrderPayment(selector) {
    this.unblock();
    new SimpleSchema({
        selector: {type: Object, blackbox: true},
    }).validate({selector});

    if (this.userId) {
        let data = PurchaseOrderPayment.find(selector);
        return data;

    }
    return this.ready();
});
