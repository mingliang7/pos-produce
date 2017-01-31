import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Item} from '../../../imports/api/collections/item.js';
import {Order} from '../../../imports/api/collections/order';
import {Customers} from '../../../imports/api/collections/customer';
// lib func
import ReportFn from '../../../imports/api/libs/report';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
export const saleDetailsMethods = new ValidatedMethod({
    name: 'cement.saleDetailsMethods',
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
            if (!params.customer || !params.so || !params.itemId) {
                return data;
            }
            else {
                data.title.customer = Customers.findOne(params.customer);
                data.title.so = params.so;
                data.title.item = Item.findOne(params.itemId);
                selector._id = params.so

            }
            // project['$invoice'] = 'Invoice';
            /****** Title *****/
            /****** Content *****/
            let groupDateObj = {};
            let arr = [];
            let totalBalance = 0;
            let totalSumRemainQty = 0;
            let orders = Order.aggregate([
                {$match: selector},
                {
                    $lookup: {
                        from: 'cement_customers',
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
                        total: {$last: '$total'},
                        sumRemainQty: {$last: '$sumRemainQty'},
                        customerDoc: {$last: '$customerDoc'},
                        item: {
                            $last: {
                                customerDoc: '$customerDoc',
                                invoiceId: '$_id',
                                invoiceDate: '$orderDate',
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
                        from: "cement_invoices",
                        localField: "_id",
                        foreignField: "saleId",
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
                            item.invoiceDate = invoice.invoiceDate;
                            item.invoiceId = invoice._id;
                            item.voucherId = invoice.voucherId;
                            item.itemName=orders[0].item.itemName;
                            item.saleId = invoice.saleId;
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
