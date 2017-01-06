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
export const invoiceEnterBillReport = new ValidatedMethod({
    name: 'cement.invoiceEnterBillReport',
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
            if(params.branchId) {
                branchId = params.branchId.split(',');
                selector.branchId = {
                    $in: branchId
                };
                selector = ReportFn.checkIfUserHasRights({currentUser: Meteor.userId(), selector});
            }
            let user = Meteor.users.findOne(Meteor.userId());
            let exchange = Exchange.findOne({}, {sort: {_id: -1}});
            let coefficient = exchangeCoefficient({exchange, fieldToCalculate: '$total'})
            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            selector.status = {$in: ['active', 'partial', 'closed']};
            if (params.date) {
                let dateAsArray = params.date.split(',');
                let fromDate = moment(dateAsArray[0]).toDate();
                let toDate = moment(dateAsArray[1]).toDate();
                data.title.date = moment(fromDate).format('YYYY-MMM-DD hh:mm a') + ' - ' + moment(toDate).format('YYYY-MMM-DD hh:mm a');
                data.title.exchange = `USD = ${coefficient.usd.$multiply[1]} $, KHR = ${coefficient.khr.$multiply[1]}<small> ៛</small>, THB = ${coefficient.thb.$multiply[1]} B`;
                selector.invoiceDate = {$gte: fromDate, $lte: toDate};
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
                        from: "cement_enterBills",
                        localField: "refBillId",
                        foreignField: "_id",
                        as: "enterBills"
                    }
                },
                {
                    $unwind: {path: '$enterBills', preserveNullAndEmptyArrays: true}
                },
                {
                    $unwind: {path: '$items', preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: "cement_item",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "items.itemDoc"
                    }
                },
                {
                    $unwind: {path: '$items.itemDoc', preserveNullAndEmptyArrays: true }
                },
                {
                    $group: {
                        _id: '$_id',
                        _customer: {$last: '$_customer'},
                        invoiceDate: {$last: '$invoiceDate'},
                        branchId: {$last: '$branchId'},
                        dueDate: {$last: '$dueDate'},
                        stockLocationId: {$last: '$stockLocationId'},
                        subTotal: {$last: '$subTotal'},
                        total: {$last: '$total'},
                        printId: {$last: '$printId'},
                        totalTransportFee: {$last: '$totalTransportFee'},
                        totalDiscount: {$last: '$totalDiscount'},
                        status: {$last: '$status'},
                        enterBills: {$last: '$enterBills'},
                        refBillId: {$last: '$refBillId'},
                        items: {
                            $push: '$items'
                        }
                    }
                },
                {
                    $lookup: {
                        from: "core_branch",
                        localField: "branchId",
                        foreignField: "_id",
                        as: "branchDoc"
                    }
                },
                {
                    $lookup: {
                        from: "cement_stockLocations",
                        localField: "stockLocationId",
                        foreignField: "_id",
                        as: "stockLocation"
                    }
                },
                {
                    $unwind: {path: '$branchDoc', preserveNullAndEmptyArrays: true},
                },
                {
                    $unwind: {path: '$stockLocation', preserveNullAndEmptyArrays: true},
                },
                {
                    $sort: {_id: 1}
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: '$$ROOT'
                        },
                        grandTotal: {$sum: '$total'}
                    }
                }
               ]);
            if (invoices.length > 0) {
                data.content = invoices[0].data;
                data.footer.grandTotal = invoices[0].grandTotal;
            }
            return data
        }
    }
});
