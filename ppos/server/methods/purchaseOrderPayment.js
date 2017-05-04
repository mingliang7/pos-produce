import {RemovedPoPayment} from '../../imports/api/collections/removedCollection';
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder';
Meteor.methods({
    insertRemovedPoPayment(doc){
        doc.status = 'removed';
        doc._id = `${doc._id}R${moment().format('YYYY-MMM-DD-HH:mm')}`;
        doc.removeDate = new Date();
        RemovedPoPayment.insert(doc);
    },
    removedPoPayment({doc}){
        let payments = PurchaseOrderPayment.find({billId: doc.billId, status: {$ne: 'removed'}});
        let selector = {$set: {paymentStatus: 'active'}};
        let collections = PurchaseOrder;
        if (payments.count() == 1) {
            collections.direct.update(doc.billId, selector)
        } else {
            PurchaseOrderPayment.update({
                billId: doc.billId, status: {$ne: 'removed'},
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
            collections.direct.update(doc.billId, selector);
        }
        PurchaseOrderPayment.remove({_id: doc._id});
    }
});