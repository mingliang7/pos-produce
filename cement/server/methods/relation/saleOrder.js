import {Meteor} from 'meteor/meteor';
import {Invoices} from '../../../imports/api/collections/invoice.js';
import {SaleOrderReceivePayment} from '../../../imports/api/collections/saleOrderReceivePayment.js';
Meteor.methods({
    isSaleOrderHasRelation: function (id) {
        let anyInvoice = Invoices.findOne({saleId: id}) || SaleOrderReceivePayment.findOne({invoiceId: id});
        return !!anyInvoice;
    }
});
