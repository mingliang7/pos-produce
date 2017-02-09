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
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
import ReportFn from "../../../imports/api/libs/report";
export const  orderSOBalanceReport = new ValidatedMethod({
    name: 'cement.orderSOBalanceReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let selector = {};
            let project = {
                totalDue: 0,
                totalPaid: 0,
                totalBalance: 0
            };
            let data = {
                title: {},
                fields: [],
                displayFields: [],
                content: [{index: 'No Result'}],
                footer: {}
            };
            let branchId = [];
            if (params.branchId) {
                branchId = params.branchId.split(',');
                selector.branchId = {
                    $in: branchId
                };
                selector = ReportFn.checkIfUserHasRights({currentUser: Meteor.userId(), selector});
            }
            let date = moment(params.date).endOf('days').toDate();
            let user = Meteor.users.findOne(Meteor.userId());
            let exchange = Exchange.findOne({}, {sort: {_id: -1}});
            let coefficient = exchangeCoefficient({exchange, fieldToCalculate: '$total'})

            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            if (params.date) {
                data.title.date = moment(params.date).format('YYYY-MMM-DD');
                data.title.exchange = `USD = ${coefficient.usd.$multiply[1]} $, KHR = ${coefficient.khr.$multiply[1]}<small> ៛</small>, THB = ${coefficient.thb.$multiply[1]} B`;
                selector.$or = [
                    {status: {$in: ['active', 'partial']}, orderDate: {$lte: date}},
                    {orderDate: {$lte: date}, status: 'closed', closedAt: {$gt: date}}
                ];
            }
            if (params.customer && params.customer != '') {
                selector.customerId = params.customer;
            }
            if (params.filter && params.filter != '') {
                let filters = params.filter.split(','); //map specific field
                data.fields.push({field: 'Type'});
                data.displayFields.push({field: 'order'});
                for (let i = 0; i < filters.length; i++) {
                    data.fields.push({field: correctFieldLabel(filters[i])});
                    data.displayFields.push({field: filters[i]});
                    project[filters[i]] = `$${filters[i]}`;
                    if (filters[i] == 'customerId') {
                        project['_customer'] = '$_customer'
                    }
                    if (filters[i] == 'repId') {
                        project['repId'] = '$repId.name'
                    }
                }
                data.fields.push({field: 'Amount'});//map total field for default
                data.displayFields.push({field: 'total'});
                project['order'] = '$order';
                project['total'] = '$total'; //get total projection for default
            } else {
                project = {
                    'order': '$order',
                    '_id': '$_id',
                    'orderDate': '$orderDate',
                    'dueDate': '$dueDate',
                    'total': '$total'
                };
                data.fields = [{field: 'Type'}, {field: 'ID'}, {field: 'order Date'}, {field: 'Aging'}, {field: 'Last Payment'}, {field: 'DueAmount'}, {field: 'PaidAmount'}, {field: 'Balance'}];
                data.displayFields = [{field: 'order'}, {field: '_id'}, {field: 'orderDate'}, {field: 'dueDate'}, {field: 'lastPaymentDate'}, {field: 'dueAmount'}, {field: 'paidAmount'}, {field: 'balance'}];
            }
            // project['$order'] = 'order';
            /****** Title *****/
            data.title.company = Company.findOne();
            /****** Content *****/
            let orders = Order.aggregate([
                {$match: selector},
                {
                    $lookup: {
                        from: "cement_saleOrderReceivePayment",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "paymentDoc"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        status: 1,
                        orderDate: 1,
                        dueDate: 1,
                        customerId: 1,
                        total: 1,
                        paymentDoc: {
                            $filter: {
                                input: '$paymentDoc',
                                as: 'payment',
                                cond: {$lte: ['$$payment.paymentDate', date]}
                            }
                        },
                    }
                },
                {$unwind: {path: '$paymentDoc', preserveNullAndEmptyArrays: true}},
                {$sort: {'paymentDoc.paymentDate': 1}},
                {
                  $project: {
                      _id: 1,
                      status: 1,
                      orderDate: 1,
                      dueDate: 1,
                      customerId: 1,
                      total: 1,
                      lastPaymentDate: {
                          $cond: [
                              {$lte: ['$paymentDoc.paymentDate', date]},
                              '$paymentDoc.paymentDate', 'None'
                              ]
                      },
                      dueAmount: {
                          $cond: [
                              {$lte: ['$paymentDoc.paymentDate', date]},
                              '$paymentDoc.dueAmount', null
                          ]
                      },
                      paidAmount: {
                          $cond: [
                              {$lte: ['$paymentDoc.paymentDate', date]},
                              '$paymentDoc.paidAmount', null
                          ]
                      },
                      paymentDoc: 1,
                  }
                },
                {
                    $group: {
                        _id: '$_id',
                        status: {$last: '$status'},
                        dueDate: {$last: '$dueDate'},
                        orderDoc: {$last: '$$ROOT'},
                        lastPaymentDate: {$last: '$lastPaymentDate'},
                        dueAmount: {
                            $last: '$dueAmount'
                        },
                        paidAmount: {
                            $last: '$paidAmount'
                        },
                        paymentDoc: {$last: '$paymentDoc'},
                        total: {$last: '$total'},
                        orderDate: {$last: '$orderDate'}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        order: {$concat: 'order'},
                        orderDoc: {
                            customerId: 1,
                            orderDate: 1
                        },
                        dueAmount: {
                            $ifNull: ["$dueAmount", "$total"]
                        },
                        paidAmount: {
                            $ifNull: ["$paidAmount", 0]
                        },
                        orderDate: 1,
                        dueDate: 1,
                        lastPaymentDate: {
                            $ifNull: ["$lastPaymentDate", "None"]
                        },
                        status: 1,
                        total: '$total'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        order: 1,
                        orderDoc: 1,
                        dueAmount: 1,
                        paidAmount: 1,
                        balance: {$subtract: ["$dueAmount", "$paidAmount"]},
                        orderDate: 1,
                        dueDate: 1,
                        lastPaymentDate: 1,
                        status: 1,
                        total: .1
                    }
                },
                {
                    $redact: {
                        $cond: {if: {$eq: ['$balance', 0]}, then: '$$PRUNE', else: '$$KEEP'}
                    }
                },
                {
                    $group: {
                        _id: '$orderDoc.customerId',
                        data: {
                            $addToSet: '$$ROOT'
                        },
                        dueDate: {$last: '$dueDate'},
                        orderDate: {$last: '$orderDate'},
                        lastPaymentDate: {$last: '$lastPaymentDate'},
                        dueAmountSubTotal: {$sum: '$dueAmount'},
                        paidAmount: {$sum: '$paidAmount'},
                        balance: {$sum: '$balance'}
                    }
                },
                {
                    $lookup: {
                        from: "cement_customers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "customerDoc"
                    }
                },
                {
                    $unwind: {path: '$customerDoc', preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $addToSet: '$$ROOT'
                        },
                        grandDueAmount: {$sum: '$dueAmountSubTotal'},
                        grandPaidAmount: {$sum: '$paidAmount'},
                        grandBalance: {$sum: '$balance'}
                    }
                }
            ]);
            if (orders.length > 0) {
                data.content = orders[0].data;
                data.footer = {
                    totalDue: orders[0].grandDueAmount,
                    totalPaid: orders[0].grandPaidAmount,
                    totalBalance: orders[0].grandBalance,
                }
            }
            return data
        }
    }
});
