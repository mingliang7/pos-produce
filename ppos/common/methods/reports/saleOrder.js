import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {Order} from '../../../imports/api/collections/order';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
export const saleOrderReport = new ValidatedMethod({
    name: 'ppos.saleOrderReport',
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
                footer: {}
            };
            let branch = [];
            let user = Meteor.users.findOne(Meteor.userId());
            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            // selector.status = {$in: ['active', 'closed']};
            // selector.sumRemainQty = {$gt: 0};
            let asDate;
            if(params.status && params.status == 'active'){
                 selector.status = {$in: ['active']};
            }
            if (params.date) {
                asDate = moment(params.date).toDate();
                data.title.date = moment(asDate).format('YYYY-MMM-DD hh:mm a');
                selector.orderDate = {$lte: asDate};
            }
            if (params.customer && params.customer != '') {
                selector.customerId = params.customer;
            }
            if (params.filter && params.filter != '') {
                let filters = params.filter.split(','); //map specific field
                for (let i = 0; i < filters.length; i++) {
                    data.fields.push({field: correctFieldLabel(filters[i])});
                    data.displayFields.push({field: filters[i]});
                    project[filters[i]] = `$${filters[i]}`;
                    if (filters[i] == 'customerId') {
                        project['_customer'] = '$_customer'
                    }
                }
                data.fields.push({field: 'Total'}); //map total field for default
                data.displayFields.push({field: 'total'});
                project['total'] = '$total'; //get total projection for default
            } else {
                project = {
                    '_id': '$_id',
                    'orderDate': '$orderDate',
                    'customer': '$_customer.name',
                    'status': '$status',
                    'sumRemainQty': '$sumRemainQty',
                    'total': '$total'
                };
                data.fields = [{field: '#ID'}, {field: 'Date'}, {field: 'Customer'}, {field: 'Status'}, {field: 'Remain Qty'}, {field: 'Total'}];
                data.displayFields = [{field: '_id'}, {field: 'orderDate'}, {field: 'customer'}, {field: 'status'}, {field: 'sumRemainQty'}, {field: 'total'}];
            }

            /****** Title *****/
            data.title.company = Company.findOne();

            /****** Content *****/
            let saleOrders = Order.aggregate([
                {
                    $match: selector
                }, {
                    $unwind: {path: '$items', preserveNullAndEmptyArrays: true},

                }, {
                    $lookup: {
                        from: "ppos_item",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {$unwind: {path: '$itemDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: '$_id',
                        data: {
                            $last: project
                        },
                        items: {
                            $push: {
                                qty: '$items.qty',
                                price: '$items.price',
                                amount: '$items.amount',
                                itemId: '$items.itemId',
                                itemName: '$itemDoc.name',
                            }
                        },
                    }
                },
                {
                    $lookup: {
                        from: "ppos_invoices",
                        localField: "_id",
                        foreignField: "saleId",
                        as: "invoiceDoc"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        data: 1,
                        items: 1,
                        total: 1,
                        totalOrder: 1,
                        sumRemainQty: 1,
                        invoicesDoc: {
                            $filter: {
                                input: "$invoiceDoc",
                                as: "invoice",
                                cond: {$lte: ["$$invoice.invoiceDate", asDate]}
                            }
                        }
                    }
                },
                {
                    $unwind: {path: '$invoicesDoc', preserveNullAndEmptyArrays: true},
                },
                {$sort: {'invoicesDoc._id': 1}},
                {
                    $unwind: {path: '$invoicesDoc.items', preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: {_id: '$_id', itemId: '$invoicesDoc.items.itemId'},
                        invoiceItemQty: {$sum: '$invoicesDoc.items.qty'},
                        invoiceItemId: {$last: '$invoicesDoc.items.itemId'},
                        data: {$last: '$data'},
                        items: {$last: '$items'},

                    }
                },
                {
                    $group: {
                        _id: '$_id._id',
                        invoiceItems: {
                            $push: {
                                qty: '$invoiceItemQty',
                                itemId: '$invoiceItemId'
                            }
                        },
                        data: {$last: '$data'},
                        items: {$last: '$items'}
                    }
                }
            ]);
            let total = 0,
                totalOrder = 0,
                totalRemainQty = 0,
                totalOrderReceive = 0;
            if (saleOrders.length > 0) {
                saleOrders.forEach(function (doc) {
                    doc.items.forEach(function (item) {
                        let invoiceItem = doc.invoiceItems.find(x => x.itemId == item.itemId);
                        if (invoiceItem) {
                            item.stockReceived = invoiceItem.qty;
                            item.remainQty = item.qty - invoiceItem.qty;
                            item.amount = item.remainQty * item.price;
                        } else {
                            item.remainQty = item.qty;
                            item.stockReceived = 0;
                            item.amount = item.remainQty * item.price;
                        }
                        total += item.amount;
                        totalOrder += item.qty;
                        totalRemainQty += item.remainQty;
                        totalOrderReceive += item.stockReceived;
                    })
                });
            }
            if (saleOrders.length > 0) {
                data.content = saleOrders
                data.footer.total = total;
                data.footer.totalOrder = totalOrder;
                data.footer.totalRemainQty = totalRemainQty;
                data.footer.totalOrderReceive = totalOrderReceive;
            }
            return data
        }
    }
});
