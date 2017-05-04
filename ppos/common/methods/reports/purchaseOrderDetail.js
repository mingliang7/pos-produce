import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Item} from '../../../imports/api/collections/item.js';
import {PurchaseOrder} from '../../../imports/api/collections/purchaseOrder';
import {Customers} from '../../../imports/api/collections/customer';
import {Vendors} from '../../../imports/api/collections/vendor';
// lib func
import ReportFn from '../../../imports/api/libs/report';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
export const purchaseOrderDetailMethod = new ValidatedMethod({
    name: 'ppos.purchaseOrderDetailMethod',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let selector = {};
            let project = {};
            let data = {
                title: {},
                fields: [],
                displayFields: [],
                content: [{index: 'No Result'}],
                footer: {
                    totalBalance: 0
                }
            };
            if (!params.customer || !params.po || !params.itemId) {
                return data;
            }
            else {
                data.title.customer = Customers.findOne(params.customer);
                data.title.po = params.po;
                data.title.item = Item.findOne(params.itemId);
                selector._id = params.po

            }
            // project['$invoice'] = 'Invoice';
            /****** Title *****/
            /****** Content *****/

            let orders = PurchaseOrder.aggregate([
                {$match: selector},
                {
                    $lookup: {
                        from: 'ppos_customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customerDoc'
                    }
                },
                {$unwind: {path: '$customerDoc', preserveNullAndEmptyArrays: true}},
                {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
                {$match: {'items.itemId': params.itemId}},
                {
                    $lookup: {
                        from: 'ppos_item',
                        localField: 'items.itemId',
                        foreignField: '_id',
                        as: 'itemDoc'
                    }
                },
                {$unwind: {path: '$itemDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: '$_id',
                        total: {$last: '$total'},
                        sumRemainQty: {$last: '$sumRemainQty'},
                        customerDoc: {$last: '$customerDoc'},
                        item: {
                            $last: {
                                customerDoc: '$customerDoc',
                                invoiceId: '$_id',
                                invoiceDate: '$purchaseOrderDate',
                                voucherId: '$voucherId',
                                itemId: '$items.itemId',
                                itemName: '$itemDoc.name',
                                remainQty: '$items.qty' ,
                                tsFee: '$items.transportFee',
                                price: '$items.price',
                                qty: '$items.qty',
                                amount: '$items.amount'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "ppos_receiveItems",
                        localField: "_id",
                        foreignField: "purchaseOrderId",
                        as: "invoiceDoc"
                    }
                }
            ]);
            if(orders.length > 0) {
                let content = [orders[0].item];
                let remainQty = orders[0].item.remainQty;
                orders[0].invoiceDoc.forEach(function (invoice) {
                    invoice.items.forEach(function (item) {
                        if(item.itemId == orders[0].item.itemId) {
                            item.remainQty = remainQty - item.qty;
                            item.stockReceived = true;
                            item.customerDoc = orders[0].item.customerDoc;
                            item.invoiceDate = invoice.receiveItemDate;
                            item.invoiceId = invoice.voucherId || invoice._id;
                            item.voucherId = invoice.voucherId;
                            item.itemName=orders[0].item.itemName;
                            item.saleId = invoice.purchaseOrderId;
                            remainQty -= item.qty;
                            content.push(item);
                        }
                    });
                });
                data.content = content;
            }
            return data
        }
    }
});
