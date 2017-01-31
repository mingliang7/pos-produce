import {Order} from '../../imports/api/collections/order';
import {Item} from '../../imports/api/collections/item';
Meteor.methods({
    saleOrderShow({_id}){
        let order = Order.aggregate([
            {$match: {_id: _id}},
            {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "cement_item",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "itemDoc"
                }
            },
            {$unwind: {path: '$itemDoc', preserveNullAndEmptyArrays: true}},
            {
                $group: {
                    _id: '$_id',
                    items: {
                        $addToSet: {
                            itemName: '$itemDoc.name',
                            qty: '$items.qty',
                            price: '$items.price',
                            discount: '$items.discount',
                            amount: '$items.amount',
                            remainQty: '$items.remainQty'
                        }
                    },
                    customer: {$last: '$_customer'},
                    branchId: {$last: '$branchId'},
                    orderDate: {$last: '$orderDate'},
                    status: {$last: '$status'},
                    total: {$last: '$total'},
                    subTotal: {$last: '$subTotal'},
                    discount: {$last: '$discount'},
                    voucherId: {$last: '$voucherId'},
                    sumRemainQty: {$last: 'sumRemainQty'}
                }
            }
        ]);
        if (order.length > 0) {
            return order[0];
        }
        return {};
    },
    getSaleOrderItemList({saleOrderId}){
        let saleOrder = Order.findOne(saleOrderId);
        let list = [];
        saleOrder.items.forEach(function (item) {
            let itemDoc = Item.findOne(item.itemId);
            item.name = itemDoc && itemDoc.name || '';
            list.push({label: item.name, value: item.itemId});
        });
        return list;
    }
});