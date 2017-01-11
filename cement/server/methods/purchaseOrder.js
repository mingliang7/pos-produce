import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder';
Meteor.methods({
    getPurchaseOrderDetail({_id}){
        let purchaseOrder = PurchaseOrder.aggregate([
            {$match: {_id: _id}},
            {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: 'cement_item',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'itemDoc'
                }
            },
            {$unwind: {path: '$itemDoc', preserveNullAndEmptyArrays: true}},
            {
                $group: {
                    _id: '$_id',
                    items: {
                        $push: {
                            price: '$items.price',
                            qty: '$items.qty',
                            name: '$itemDoc.name',
                            amount: '$items.amount',
                            remainQty: '$items.remainQty'
                        }
                    },
                    status: {$last: '$status'},
                    voucherId: {$last: '$voucherId'},
                    paymentStatus: {$last: '$paymentStatus'},
                    purchaseOrderDate: {$last: '$purchaseOrderDate'},
                    total: {$last: '$total'},
                    sumRemainQty: {$last: '$sumRemainQty'},
                    _vendor: {$last: '$_vendor'},
                    _customer: {$last: '$_customer'},
                }
            }

        ]);
        if(purchaseOrder.length > 0) {
            return purchaseOrder[0];
        }
        return {};
    }
});