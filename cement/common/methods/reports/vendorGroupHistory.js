import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {GroupBill} from '../../../imports/api/collections/groupBill';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
// lib func
import ReportFn from '../../../imports/api/libs/report';
export const vendorGroupHistoryReport = new ValidatedMethod({
    name: 'cement.vendorGroupHistory',
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

            if (params.date) {
                data.title.date = moment(params.date).format('DD/MM/YY')
                selector.startDate = {
                    $lte: moment(params.date).endOf('days').toDate()
                }
            }
            if (params.vendor && params.vendor != '') {
                selector.vendorOrCustomerId = params.vendor;
            }else{
                return data;
            }
            // project['$invoice'] = 'Invoice';
            /****** Title *****/
            data.title.company = Company.findOne();
            /****** Content *****/
            let groupBills = GroupBill.aggregate([
                {$match: selector},
                {
                    $lookup: {
                        from: "cement_payBill",
                        localField: "_id",
                        foreignField: "billId",
                        as: "payBillDoc"
                    }
                }, {
                    $project: {
                        vendorOrCustomerId: 1,
                        voucher: 1,
                        _id: 1,
                        total: 1,
                        startDate: 1,
                        endDate: 1,
                        items: 1,
                        payBillDoc: 1,
                    }
                },
                {$unwind: {path: '$payBillDoc', preserveNullAndEmptyArrays: true}},
                {
                    $project: {
                        vendorOrCustomerId: 1,
                        _id: 1,
                        voucherId: 1,
                        total: 1,
                        paidAmount: {
                            $cond: [

                                {
                                    $lte: ['$payBillDoc.paymentDate', moment(params.date).endOf('days').toDate()]
                                },

                                '$payBillDoc.paidAmount',
                                0
                            ]
                        },
                        items: 1,
                        startDate: 1,
                        endDate: 1,
                        payBillDoc: {
                            $cond: [

                                {
                                    $lte: ['$payBillDoc.paymentDate', moment(params.date).endOf('days').toDate()]
                                },

                                '$payBillDoc',
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
                        startDate: {$last: '$startDate'},
                        endDate: {$last: '$endDate'},
                        vendorOrCustomerId: {$last: '$vendorOrCustomerId'},
                        voucherId: {$last: '$voucherId'},
                        payBillDoc: {
                            $push: '$payBillDoc'
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        invoiceId: {$last: '$_id'},
                        total: {$last: '$total'},
                        balanceAmount: {$last: '$balanceAmount'},
                        paidAmount: {$last: '$paidAmount'},
                        startDate: {$last: '$startDate'},
                        endDate: {$last: '$endDate'},
                        vendorOrCustomerId: {$last: '$vendorOrCustomerId'},
                        voucherId: {$last: '$voucherId'},
                        payBillDoc: {$last: '$payBillDoc'},
                        // items: {
                        //     $push: {
                        //         itemName: '$itemsDoc.name',
                        //         price: '$items.price',
                        //         qty: '$items.qty',
                        //         amount: '$items.amount'
                        //     }
                        // }
                    }
                },
                {
                    $group: {
                        _id: '$vendorOrCustomerId',
                        total: {$sum: '$total'},
                        balanceAmount: {$sum: {$subtract: ['$total', '$paidAmount']}},
                        paidAmount: {$sum: '$paidAmount'},
                        data: {$push: '$$ROOT'}
                    }
                },
                {
                    $lookup: {
                        from: 'cement_vendors',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendorDoc'
                    }
                },
                {$unwind: {path: '$vendorDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: '$$ROOT'
                        },
                        totalBalance: {$sum: '$balanceAmount'}
                    }
                }
            ]);
            if (groupBills.length > 0) {
                data.content = groupBills[0].data;
                data.footer.totalBalance = groupBills[0].totalBalance;
            }
            return data
        }
    }
});
