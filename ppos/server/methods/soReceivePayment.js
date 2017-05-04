import {SaleOrderReceivePayment} from '../../imports/api/collections/saleOrderReceivePayment';
import {Order} from '../../imports/api/collections/order';
import  {RemovedSoPayment} from '../../imports/api/collections/removedCollection';
Meteor.methods({
    insertRemovedSoPayment(doc){
        doc.status = 'removed';
        doc._id = `${doc._id}R${moment().format('YYYY-MMM-DD-HH:mm')}`;
        doc.removeDate = new Date();
        RemovedSoPayment.insert(doc);
    },
    removedSoReceivePayment({doc}){
        let payments = SaleOrderReceivePayment.find({invoiceId: doc.invoiceId, status: {$ne: 'removed'}});
        let selector = {$set: {paymentStatus: 'active'}};
        if (payments.count() == 1) {
            Order.direct.update(doc.invoiceId, selector)
        } else {
            SaleOrderReceivePayment.update({
                invoiceId: doc.invoiceId, status: {$ne: 'removed'},
                _id: {$ne: doc._id},
                $or: [
                    {paymentDate: {$gt: doc.paymentDate}},
                    {dueAmount: {$lt: doc.dueAmount}}
                ]
            }, {
                $inc: {dueAmount: doc.paidAmount, balanceAmount: doc.paidAmount},
                $set: {status: 'partial'}
            }, {multi: true});
            selector.$set.paymentStatus = 'partial';
            Order.direct.update(doc.invoiceId, selector);
        }
        SaleOrderReceivePayment.remove({_id: doc._id});
    }
});