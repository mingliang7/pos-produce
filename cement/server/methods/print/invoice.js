import {Invoices} from '../../../imports/api/collections/invoice';

Meteor.methods({
    printInvoice({invoiceId}){
        let invoice = Invoices.aggregate([
            {$match: {_id: invoiceId}},

            {
                $lookup: {
                    from: "cement_customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "_customer"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "staffId",
                    foreignField: "_id",
                    as: "_staff"
                }
            },

            {$unwind: {path: '$_customer', preserveNullAndEmptyArrays: true}},
            {$unwind: {path: '$_staff', preserveNullAndEmptyArrays: true}},
            {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "cement_item",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "items.itemDoc"
                }
            },
            {$unwind: {path: '$items.itemDoc', preserveNullAndEmptyArrays: true}},
            {
                $group:{
                    _id:invoiceId,
                    saleDate: {
                        $last: '$invoiceDate'
                    },
                    _customer: {$last: '$_customer'},
                    _staff: {$last: '$_staff'},
                    total: {$last: '$total'},
                    subTotal: {$last: '$subTotal'},
                    discount: {$last: '$discount'},
                    items:{$push:"$items"}
                }
            },
            {
                $lookup: {
                    from: "cement_receivePayment",
                    localField: "_id",
                    foreignField: "invoiceId",
                    as: "paymentDoc"
                }
            },
            {$unwind: {path: '$paymentDoc', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    sale: {
                        _id: '$_id',
                        _customer: '$_customer',
                        _staff: '$_staff',
                        saleDate: '$invoiceDate',
                        total: '$total',
                        subTotal: '$subTotal',
                        discount: '$discount'
                    },
                    saleDetails: '$items',
                    paymentObj: {
                        paidAmount: {$sum: "$paymentDoc.paidAmount"},
                        balanceAmount: {$subtract: ['$total', {$sum: "$paymentDoc.paidAmount"}]}
                    }
                }
            }
        ]);
        if(invoice.length>0) {
            console.log(invoice[0]);
            return invoice[0];
        }
        return [{}];
    }
});