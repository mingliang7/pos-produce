import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {Order} from '../../../imports/api/collections/order';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
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
            let branchId = [];
            if (!params.customer) {
                return data;
            }
            if (params.branchId) {
                branchId = params.branchId.split(',');
                selector.branchId = {
                    $in: branchId
                };
                selector = ReportFn.checkIfUserHasRights({currentUser: Meteor.userId(), selector});
            }
            let exchange = Exchange.findOne({}, {sort: {_id: -1}});
            let coefficient = exchangeCoefficient({exchange, fieldToCalculate: '$total'})
            var currentArrDate;
            if (params.date) {
                currentArrDate = params.date;
                data.title.date = moment(currentArrDate).format('YYYY-MMM-DD');
                selector.orderDate = {
                    $lte: moment(currentArrDate).endOf('days').toDate()
                }
            }
            if (params.customer && params.customer != '') {
                selector.customerId = params.customer;
            }
            // project['$invoice'] = 'Invoice';
            /****** Title *****/
            data.title.company = Company.findOne();
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
                {$unwind: '$items'},
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
                        items: {
                            $push: {
                                customerDoc: '$customerDoc',
                                invoiceDate: '$orderDate',
                                voucherId: '$voucherId',
                                itemName: '$itemDoc.name',
                                remainQty: '$items.remainQty',
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
            orders.forEach(function (doc) {
                let groupDate = moment(doc.orderDate).format('MM-YYYY');
                if (!groupDateObj[groupDate]) {
                    groupDateObj[groupDate] = {
                        customer: doc.customerDoc,
                        date: moment(doc.orderDate).toDate(),
                        data: [{
                            _id: doc._id,
                            voucherId: doc.voucherId,
                            type: 'order',
                            inv: true,
                            date: moment(doc.orderDate).toDate(),
                            items: doc.items,
                            total: doc.total
                        }]
                    }
                } else {
                    groupDateObj[groupDate].data.push({
                        _id: doc._id,
                        voucherId: doc.voucherId,
                        type: 'order',
                        inv: true,
                        date: moment(doc.orderDate).toDate(),
                        items: doc.items,
                        total: doc.total
                    })
                }
                doc.invoiceDoc.forEach(function (invoice) {
                    let queryDate = moment(currentArrDate).format('YYYY-MM-DD');
                    let invoiceDate = moment(invoice.invoiceDate);
                    if (invoiceDate.isSameOrBefore(queryDate)) {
                        let groupPayDate = moment(invoice.invoiceDate).format('MM-YYYY');
                        if (!groupDateObj[groupPayDate]) {
                            groupDateObj[groupPayDate] = {
                                customer: doc.customerDoc,
                                date: moment(invoice.invoiceDate).toDate(),
                                data: [{
                                    _id: invoice._id,
                                    invoiceId: invoice.invoiceId,
                                    voucherId: invoice.voucherId,
                                    type: 'invoice',
                                    inv: true,
                                    date: moment(invoice.invoiceDate).toDate(),
                                    items: invoice.items
                                }]
                            }
                        } else {
                            groupDateObj[groupPayDate].data.push({
                                _id: invoice._id,
                                invoiceId: invoice.invoiceId,
                                voucherId: invoice.voucherId,
                                type: 'invoice',
                                inv: true,
                                date: moment(invoice.invoiceDate).toDate(),
                                items: invoice.items
                            })
                        }
                    }

                });
            });

            for (let k in groupDateObj) {
                let sortData = _.sortBy(groupDateObj[k].data, function (value) {
                    return new Date(value.date);
                });
                groupDateObj[k].data = sortData;
                arr.push(groupDateObj[k]);
            }
            let afterSortArr = arr.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            // afterSortArr.forEach(function (doc) {
            //
            // });
            //
            if (afterSortArr.length > 0) {
                data.content = arr;
            }
            return data
        }
    }
});
