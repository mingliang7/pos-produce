import {TSSOPayment} from '../../imports/api/collections/tsSoPayment';
import {Order} from '../../imports/api/collections/order';
import {RemoveTsSoPayment} from '../../imports/api/collections/removedCollection';
Meteor.methods({
    insertRemovedTsSoPayment(doc){
        doc.status = 'removed';
        doc._id = `${doc._id}R${moment().format('YYYY-MMM-DD-HH:mm')}`;
        doc.removeDate = new Date();
        RemoveTsSoPayment.insert(doc);
    },
    removedTSSOPayment({doc}){
        let payments = TSSOPayment.find({invoiceId: doc.invoiceId, status: {$ne: 'removed'}});
        let selector = {$set: {tsStatus: 'active'}};
        let collections = Order;
        if (payments.count() == 1) {
            collections.direct.update(doc.invoiceId, selector)
        } else {
            TSSOPayment.update({
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
            selector.$set.tsStatus = 'partial';
            collections.direct.update(doc.invoiceId, selector);
        }
        TSSOPayment.remove({_id: doc._id});
    }
});