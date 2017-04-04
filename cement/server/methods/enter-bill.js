import {EnterBills} from '../../imports/api/collections/enterBill';
import {Invoices} from '../../imports/api/collections/invoice';

Meteor.methods({
    previewEnterBill({_id}){
        let enterBill = EnterBills.aggregate([
            {
                $match: {_id: _id}
            },
            {
                $unwind: {
                    path: '$items',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'cement_item',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'items.itemDoc'
                }
            },
            {
                $unwind: {path: '$items.itemDoc', preserveNullAndEmptyArrays: true}
            },
            {
                $group: {
                    _id: '$_id',
                    items: {
                        $push: '$items'
                    },
                    total: {$last: '$total'},
                    invoiceId: {$last: '$invoiceId'},
                    enterBillDate: {$last: '$enterBillDate'},
                    dueDate: {$last: '$dueDate'},
                    status: {$last: '$status'},
                    vendorId: {$last: '$vendorId'},
                    paymentGroupId: {$last: '$paymentGroupId'},
                    description: {$last: '$description'},
                }
            },
            {
                $lookup: {
                    from: 'cement_vendors',
                    localField: 'vendorId',
                    foreignField: '_id',
                    as: 'vendorDoc'
                }
            },
            {
                $unwind: {path: '$vendorDoc', preserveNullAndEmptyArrays: true}
            }
        ]);
        return enterBill.length > 0 ? enterBill[0] : {};
    },
    getMinimumDateFromInvoice(invoiceIds){
        let invoice = Invoices.find({_id: {$in: invoiceIds}}, {sort: {invoiceDate: 1}}).fetch();
        return invoice.length > 0 ? invoice[invoice.length - 1 ] : null
    }
});