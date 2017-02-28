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
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
import ReportFn from "../../../imports/api/libs/report";
export const unpaidCustomerSummary = new ValidatedMethod({
    name: 'pos.unpaidCustomerSummary',
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
            let branchId = [];
            if (params.branchId) {
                branchId = params.branchId.split(',');
                selector.branchId = {
                    $in: branchId
                };
                selector = ReportFn.checkIfUserHasRights({currentUser: Meteor.userId(), selector});
            }
            let user = Meteor.users.findOne(Meteor.userId());
            let exchange = Exchange.findOne({}, {sort: {_id: -1}});
            let coefficient = exchangeCoefficient({exchange, fieldToCalculate: '$total'})
            let filterItems = {'items.itemId': {$ne: ''}};
            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            selector.invoiceType = {$eq: 'term'};
            let toDate;
            if (params.date) {
                toDate = moment(params.date).endOf('days').toDate();
                data.title.date = moment(toDate).format('YYYY-MMM-DD hh:mm a');
                data.title.exchange = `USD = ${coefficient.usd.$multiply[1]} $, KHR = ${coefficient.khr.$multiply[1]}<small> ៛</small>, THB = ${coefficient.thb.$multiply[1]} B`;
                selector.$or = [
                   {status: {$in: ['active', 'partial']}, invoiceDate: {$lte: toDate}},
                   {invoiceDate: {$lte: toDate}, status: 'closed', closedAt: {$gt: toDate}},
               ];
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
                    $match: selector
                },
                {
                    $lookup: {
                        from: 'cement_receivePayment',
                        localField: '_id',
                        foreignField: 'invoiceId',
                        as: 'receivePaymentDoc'
                    }
                },
                {
                    $unwind: {
                        path: '$receivePaymentDoc',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        invoiceId: 1,
                        total: 1,
                        receivePaymentDoc: {
                            paidAmount: {
                                $cond: [
                                    {$lte: ["$receivePaymentDoc.paymentDate", toDate]}
                                    , '$receivePaymentDoc.paidAmount', 0
                                ]
                            }
                        }
                    }
                },

                {
                  $group: {
                      _id: '$_id',
                      customerId: {$last: '$customerId'},
                      customerDoc: {$last: '$customerDoc'},
                      total: {$last: '$total'},
                      paidAmount: {$sum: '$receivePaymentDoc.paidAmount'},
                  }
                },
                {
                  $project: {
                      _id: 1,
                      customerId: 1,
                      customerDoc: 1,
                      total: {$subtract: ['$total', '$paidAmount']}
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
                    $unwind: {path: '$customerDoc', preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: '$customerId',
                        customerDoc: {$last: '$customerDoc'},
                        total: {$sum: '$total'}
                    }
                },
                {
                    $sort: {'customerDoc.name': 1}
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: '$$ROOT'
                        },
                        grandTotal: {$sum: '$total'},
                    }
                }

            ]);
            if (invoices.length > 0) {
                data.content = invoices[0].data;
                data.footer = {
                    grandTotal: invoices[0].grandTotal,
                }
            }
            return data
        }
    }
});
