import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from 'meteor/momentjs:moment';
// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {GroupBill} from '../../../imports/api/collections/groupBill';
import {Vendors} from '../../../imports/api/collections/vendor';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
// lib func
import ReportFn from '../../../imports/api/libs/report';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
export const vendorHistoryReport = new ValidatedMethod({
    name: 'ppos.vendorHistoryReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let selector = {};
            let project = {};
            let billByGroupId = {};
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
            if (!params.vendor) {
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
                data.title.vendor = params.vendor && Vendors.findOne(params.vendor);                
                selector.startDate = {
                    $lte: moment(currentArrDate).endOf('days').toDate()
                }
            }
            if (params.vendor && params.vendor != '') {
                selector.vendorOrCustomerId = params.vendor;
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
            let groupBills = GroupBill.aggregate([{
                    $match: selector
                },
                {
                    $lookup: {
                        from: 'ppos_vendors',
                        localField: 'vendorOrCustomerId',
                        foreignField: '_id',
                        as: 'vendorDoc'
                    }
                },
                {
                    $unwind: {
                        path: '$vendorDoc',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "ppos_payBill",
                        localField: "_id",
                        foreignField: "billId",
                        as: "payBillDoc"
                    }
                }
            ]);
            groupBills.forEach(function (doc) {
                let groupDate = moment(doc.startDate).format('MM-YYYY');
                if (!groupDateObj[groupDate]) {
                    groupDateObj[groupDate] = {
                        vendor: doc.vendorDoc,
                        date: moment(doc.startDate).toDate(),
                        data: [{
                            _id: doc._id,
                            voucherId: doc.voucherId,
                            type: 'invoice',
                            inv: true,
                            date: moment(doc.startDate).toDate(),
                            paidAmount: 0,
                            balance: 0,
                            total: doc.total,
                        }]
                    }
                    billByGroupId[doc._id] = {bills: doc.invoices};
                } else {
                    groupDateObj[groupDate].data.push({
                        _id: doc._id,
                        voucherId: doc.voucherId,
                        type: 'invoice',
                        inv: true,
                        date: moment(doc.startDate).toDate(),
                        paidAmount: 0,
                        balance: 0,
                        total: doc.total,
                    })
                    billByGroupId[doc._id] = {bills: doc.invoices};                    
                }
                doc.payBillDoc.forEach(function (payment) {
                    let formatPaymentDate = moment(payment.paymentDate).format('YYYY-MM-DD 00:00:00');
                    let queryDate = moment(currentArrDate).endOf('days').format('YYYY-MM-DD');
                    let paymentDate = moment(payment.paymentDate);
                    if (paymentDate.isSameOrBefore(queryDate)) {
                        let groupPayDate = moment(payment.paymentDate).format('MM-YYYY');
                        if (!groupDateObj[groupPayDate]) {
                            groupDateObj[groupPayDate] = {
                                vendor: doc.vendorDoc,
                                date: moment(payment.paymentDate).toDate(),
                                data: [{
                                    _id: payment._id,
                                    billId: payment.billId,
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
                                billId: payment.billId,
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
                        o.balanceAmount = beginningBalance + o.total;
                        totalAmount += o.total;
                        beginningBalance += o.total;
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
                data.bills = billByGroupId;
                data.footer.totalAmount = totalAmount;
                data.footer.totalPaidAmount = totalPaidAmount;
                data.footer.totalBalance = totalAmount - totalPaidAmount;
            }
            return data
        }
    }
});