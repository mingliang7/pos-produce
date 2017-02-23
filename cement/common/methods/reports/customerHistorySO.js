import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from 'meteor/momentjs:moment';
// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {Order} from '../../../imports/api/collections/order';
import {Customers} from '../../../imports/api/collections/customer';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
// lib func
import ReportFn from '../../../imports/api/libs/report';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
export const customerHistorySOReport = new ValidatedMethod({
    name: 'cement.customerHistorySOReport',
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
                content: [{
                    index: 'No Result'
                }],
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
                selector = ReportFn.checkIfUserHasRights({
                    currentUser: Meteor.userId(),
                    selector
                });
            }else{
                return data;
            }
            let exchange = Exchange.findOne({}, {
                sort: {
                    _id: -1
                }
            });
            let coefficient = exchangeCoefficient({
                exchange,
                fieldToCalculate: '$total'
            })
            var currentArrDate;
            if (params.date) {
                currentArrDate = params.date;
                data.title.date = moment(currentArrDate).format('YYYY-MMM-DD');
                data.title.exchange = `USD = ${coefficient.usd.$multiply[1]} $, KHR = ${coefficient.khr.$multiply[1]}<small> ៛</small>, THB = ${coefficient.thb.$multiply[1]} B`;
                data.title.customer = params.customer && Customers.findOne(params.customer);                
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
            let beginningBalance = 0;
            let totalPaidAmount = 0;
            let totalAmount = 0;
            let totalBalance = 0;
            let orders = Order.aggregate([{
                    $match: selector
                },
                {
                    $unwind: '$items'
                },
                {
                    $lookup: {
                        from: 'cement_item',
                        localField: 'items.itemId',
                        foreignField: '_id',
                        as: 'itemDoc'
                    }
                },
                {
                    $unwind: {
                        path: '$itemDoc',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        total: {
                            $last: '$total'
                        },
                        customerId: {
                            $last: '$customerId'
                        },
                        orderDate: {
                            $last: '$orderDate'
                        },
                        voucherId: {
                            $last: '$voucherId'
                        },
                        items: {
                            $push: {
                                itemName: '$itemDoc.name',
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
                        from: 'cement_customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customerDoc'
                    }
                },
                {
                    $unwind: {
                        path: '$customerDoc',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "cement_saleOrderReceivePayment",
                        localField: "_id",
                        foreignField: "invoiceId",
                        as: "paymentDoc"
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
                            type: 'invoice',
                            inv: true,
                            date: moment(doc.orderDate).toDate(),
                            paidAmount: 0,
                            balance: 0,
                            items: doc.items,
                            total: doc.total
                        }]
                    }
                } else {
                    groupDateObj[groupDate].data.push({
                        _id: doc._id,
                        voucherId: doc.voucherId,
                        type: 'invoice',
                        inv: true,
                        date: moment(doc.orderDate).toDate(),
                        paidAmount: 0,
                        balance: 0,
                        items: doc.items,
                        total: doc.total
                    })
                }
                doc.paymentDoc.forEach(function (payment) {
                    let formatPaymentDate = moment(payment.paymentDate).format('YYYY-MM-DD 00:00:00');
                    let queryDate = moment(currentArrDate).format('YYYY-MM-DD');
                    let paymentDate = moment(payment.paymentDate);
                    if (paymentDate.isSameOrBefore(queryDate)) {
                        let groupPayDate = moment(payment.paymentDate).format('MM-YYYY');
                        if (!groupDateObj[groupPayDate]) {
                            groupDateObj[groupPayDate] = {
                                customer: doc.customerDoc,
                                date: moment(payment.paymentDate).toDate(),
                                data: [{
                                    _id: payment._id,
                                    invoiceId: payment.invoiceId,
                                    voucherId: payment.voucherId,
                                    type: 'receive-payment',
                                    rp: true,
                                    date: moment(formatPaymentDate).toDate(),
                                    paidAmount: payment.paidAmount,
                                    balance: payment.balanceAmount
                                }]
                            }
                        } else {
                            groupDateObj[groupPayDate].data.push({
                                _id: payment._id,
                                invoiceId: payment.invoiceId,
                                voucherId: payment.voucherId,
                                type: 'receive-payment',
                                rp: true,
                                date: moment(formatPaymentDate).toDate(),
                                paidAmount: payment.paidAmount,
                                balance: payment.balanceAmount
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
            let groupPaymentByDay = {};
            afterSortArr.forEach(function (doc) {
                doc.data.forEach(function (o) {
                    if (o.type == 'invoice') {
                        o.beginningBalance = o.total + beginningBalance;
                        beginningBalance += o.total;
                        o.balanceAmount = beginningBalance + o.total;
                        totalAmount += o.total;
                    } else {
                        let paymentDate = moment(o.date).format('DD/MM/YYYY');
                        o.beginningBalance = beginningBalance - o.paidAmount;
                        o.balanceAmount = o.balance;
                        beginningBalance -= o.paidAmount;
                        totalPaidAmount += o.paidAmount;
                         if (!groupPaymentByDay[paymentDate]) {
                            groupPaymentByDay[paymentDate] = {
                                paids: [o.paidAmount],
                                balance: [beginningBalance],
                                payments: [o]
                            }
                        } else {
                            groupPaymentByDay[paymentDate].paids.push(o.paidAmount);
                            groupPaymentByDay[paymentDate].balance.push(beginningBalance);
                            groupPaymentByDay[paymentDate].payments.push(o);
                        }
                    }
                });
            });
            if (afterSortArr.length > 0) {
                data.content = arr;
                data.payments = groupPaymentByDay;
                data.footer.totalAmount = totalAmount;
                data.footer.totalPaidAmount = totalPaidAmount;
                data.footer.totalBalance = totalAmount - totalPaidAmount;
            }
            return data
        }
    }
});