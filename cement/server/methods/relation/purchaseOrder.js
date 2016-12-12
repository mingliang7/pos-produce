import {Meteor} from 'meteor/meteor';
import {PurchaseOrderPayment} from '../../../imports/api/collections/purchaseOrderPayment.js';
import {ReceiveItems} from '../../../imports/api/collections/receiveItem.js';
Meteor.methods({
    isPurchaseOrderHasRelation: function (id) {
        let anyInvoice = PurchaseOrderPayment.findOne({billId: id}) || ReceiveItems.findOne({purchaseOrderId: id});
        return !!anyInvoice;
    }
});
