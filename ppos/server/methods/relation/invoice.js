import {invoiceState} from '../../../common/globalState/invoice';
import {Customers} from '../../../imports/api/collections/customer';
import {ReceivePayment} from '../../../imports/api/collections/receivePayment';
import {GroupInvoice} from '../../../imports/api/collections/groupInvoice';
import {TSPayment} from '../../../imports/api/collections/tsPayment';
import {EnterBills} from '../../../imports/api/collections/enterBill.js';
Meteor.methods({
    getInvoiceId(tmpId){
        Meteor._sleepForMs(1000);
        let invoice = invoiceState.get(tmpId);
        delete invoiceState._obj[tmpId];
        // invoiceState.set({}); //clearing state
        return invoice;
    },
    unsetTerm(id){
        Customers.direct.update(id, {$unset: {termId: '', _term: ''}});
    },
    unsetGroup(id){
        Customers.direct.update(id, {$unset: {paymentGroupId: '', _paymentGroup: ''}});
    },
    isInvoiceHasRelation: function (id) {
        let enterBill = EnterBills.findOne({invoiceId: id});
        let groupInvoice = GroupInvoice.findOne({'invoices._id': id, status: {$ne: 'active'}});
        let receivePayment = ReceivePayment.findOne({invoiceId: id});
        let tsPayment = TSPayment.findOne({invoiceId: id});
        return !!(receivePayment || groupInvoice || tsPayment || enterBill);
    }
});
