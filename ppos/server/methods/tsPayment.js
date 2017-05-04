import {TSPayment} from '../../imports/api/collections/tsPayment';
import {Invoices} from '../../imports/api/collections/invoice';
import {RemoveTsPayment} from '../../imports/api/collections/removedCollection';
Meteor.methods({
    insertRemovedTsPayment(doc){
        doc.status = 'removed';
        doc._id = `${doc._id}R${moment().format('YYYY-MMM-DD-HH:mm')}`;
        doc.removeDate = new Date();
        RemoveTsPayment.insert(doc);
    },
    removedTSPayment({doc}){
        let payments = TSPayment.find({invoiceId: doc.invoiceId, status: {$ne: 'removed'}});
        let selector = {$set: {tsStatus: 'active'}};
        let collections = Invoices;
        if (payments.count() == 1) {
            collections.direct.update(doc.invoiceId, selector)
        } else {
            TSPayment.update({
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
        TSPayment.remove({_id: doc._id});
    }
});