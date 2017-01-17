import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {Invoices} from '../../../imports/api/collections/invoice';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
// lib func
import ReportFn from '../../../imports/api/libs/report';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
export const customerHistoryReport = new ValidatedMethod({
    name: 'cement.customerHistoryReport',
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
            if(!params.customer) {
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
            selector.invoiceType = {$eq: 'term'};
            var currentArrDate;
            if (params.date) {
                currentArrDate = params.date;
                data.title.date = moment(currentArrDate).format('YYYY-MMM-DD');
                data.title.exchange = `USD = ${coefficient.usd.$multiply[1]} $, KHR = ${coefficient.khr.$multiply[1]}<small> ៛</small>, THB = ${coefficient.thb.$multiply[1]} B`;
                selector.invoiceDate = {
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
            let invoices = Invoices.aggregate([
                {
                    $facet: {
                        groupByCustomers: [
                            {$match: selector},
                            {
                                $lookup: {
                                    from: "cement_receivePayment",
                                    localField: "_id",
                                    foreignField: "invoiceId",
                                    as: "receivePaymentDoc"
                                }
                            }, {
                                $project: {
                                    customerId: 1,
                                    voucher: 1,
                                    _id: 1,
                                    total: 1,
                                    invoiceDate: 1,
                                    items: 1,
                                    receivePaymentDoc: 1,
                                }
                            },
                            {$unwind: {path: '$receivePaymentDoc', preserveNullAndEmptyArrays: true}},
                            {
                                $project: {
                                    customerId: 1,
                                    _id: 1,
                                    voucherId: 1,
                                    total: 1,
                                    paidAmount: {
                                        $cond: [

                                            {
                                                $lte: ['$receivePaymentDoc.paymentDate', moment(currentArrDate).endOf('days').toDate()]
                                            },

                                            '$receivePaymentDoc.paidAmount',
                                            0
                                        ]
                                    },
                                    items: 1,
                                    invoiceDate: 1,
                                    receivePaymentDoc: {
                                        $cond: [

                                            {
                                                $lte: ['$receivePaymentDoc.paymentDate', moment(currentArrDate).endOf('days').toDate()]
                                            },

                                            '$receivePaymentDoc',
                                            null
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id',
                                    items: {$last: '$items'},
                                    invoiceId: {$last: '$_id'},
                                    total: {$last: '$total'},
                                    paidAmount: {$sum: '$paidAmount'},
                                    invoiceDate: {$last: '$invoiceDate'},
                                    customerId: {$last: '$customerId'},
                                    voucherId: {$last: '$voucherId'},
                                    receivePaymentDoc: {
                                        $push: '$receivePaymentDoc'
                                    }
                                }
                            },
                            {
                                $unwind: {path: '$items', preserveNullAndEmptyArrays: true}
                            },
                            {
                                $lookup: {
                                    from: 'cement_item',
                                    localField: 'items.itemId',
                                    foreignField: '_id',
                                    as: 'itemsDoc'
                                }
                            },
                            {
                                $unwind: {path: '$itemsDoc', preserveNullAndEmptyArrays: true}
                            },
                            {$sort: {"itemsDoc.name": 1}},
                            {
                                $group: {
                                    _id: '$_id',
                                    invoiceId: {$last: '$_id'},
                                    total: {$last: '$total'},
                                    balanceAmount: {$last: '$balanceAmount'},
                                    paidAmount: {$last: '$paidAmount'},
                                    invoiceDate: {$last: '$invoiceDate'},
                                    customerId: {$last: '$customerId'},
                                    voucherId: {$last: '$voucherId'},
                                    receivePaymentDoc: {$last: '$receivePaymentDoc'},
                                    items: {
                                        $push: {
                                            itemName: '$itemsDoc.name',
                                            price: '$items.price',
                                            qty: '$items.qty',
                                            amount: '$items.amount'
                                        }
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: {month: {$month: '$invoiceDate'}, year:{$year: '$invoiceDate'}},
                                    invoiceDate: {$last: '$invoiceDate'},
                                    customerId: {$last: '$customerId'},
                                    total: {$sum: '$total'},
                                    balanceAmount: {$sum: {$subtract: ['$total', '$paidAmount']}},
                                    paidAmount: {$sum: '$paidAmount'},
                                    data: {$push: '$$ROOT'},
                                }
                            },
                            {
                                $project: {
                                    _id: {$dateToString: { format: "%m-%Y", date: "$invoiceDate" }},
                                    customerId: 1,
                                    invoiceDate: 1,
                                    total:1,
                                    balanceAmount: 1,
                                    paidAmount: 1,
                                    data: 1
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
                            {$unwind: {path: '$customerDoc', preserveNullAndEmptyArrays: true}},
                            {
                                $group: {
                                    _id: null,
                                    invoiceDate: {$push: '$invoiceDate'},
                                    data: {
                                        $push: '$$ROOT'
                                    },
                                    totalBalance: {$sum: '$balanceAmount'}
                                }
                            }
                        ],
                        groupByDate: [
                            {$match: selector},
                            {
                                $lookup: {
                                    from: 'cement_receivePayment',
                                    localField: '_id',
                                    foreignField: 'invoiceId',
                                    as: 'paymentDoc'
                                }
                            },
                            {$unwind: {path: '$paymentDoc', preserveNullAndEmptyArrays: true}},
                            {
                                $project: {
                                    invoiceDate: 1,
                                    _id: 1,
                                    total: 1,
                                    paidAmount: {
                                        $cond: [
                                            {$lt: ["$paymentDoc.paymentDate", moment(currentArrDate).toDate()]},
                                            '$paymentDoc.paidAmount',0
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: '$_id',
                                    invoiceDate: {$last: '$invoiceDate'},
                                    total: {$last: '$total'},
                                    paidAmount:{$sum: '$paidAmount'}
                                }
                            },
                            {
                                $group: {
                                    _id: {
                                        month: {$month: '$invoiceDate'},
                                        year: {$year: '$invoiceDate'}
                                    },
                                    invoiceDate: {$last: '$invoiceDate'},
                                    total: {$sum: '$total'},
                                    paidAmount: {$sum: '$paidAmount'}
                                }
                            },
                            {
                                $project: {
                                    _id: {$dateToString: { format: "%m-%Y", date: "$invoiceDate" }},
                                    total: 1,
                                    invoiceDate:1,
                                    paidAmount: 1,
                                    balance: {$subtract: ["$total", "$paidAmount"]}
                                }
                            },
                            {
                                $sort: {invoiceDate: 1}
                            }
                        ]
                    }
                }
            ]);
            if (invoices[0].groupByCustomers.length > 0) {
                data.groupByDate = invoices[0].groupByDate;
                data.content = invoices[0].groupByCustomers[0].data;
                data.invoiceDateArr = invoices[0].groupByCustomers[0].invoiceDate;
                data.footer.totalBalance = invoices[0].groupByCustomers[0].totalBalance;
            }
            return data
        }
    }
});
