import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {EnterBills} from '../../../imports/api/collections/enterBill';
import {Exchange} from '../../../../core/imports/api/collections/exchange';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
import {exchangeCoefficient} from '../../../imports/api/libs/exchangeCoefficient';
import ReportFn from "../../../imports/api/libs/report";
export const enterBillByItemReport = new ValidatedMethod({
    name: 'ppos.enterBillByItemReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let selector = {};
            let filterItem = {$exists: true};
            let sortObj = {};
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
            if(params.itemId) {
                filterItem = {$eq: params.itemId}
            }
            if(params.sortBy){
                sortObj[`items.${params.sortBy}`] = 1;
            }else{
                sortObj['items.date'] = 1;
            }

            let exchange = Exchange.findOne({}, {sort: {_id: -1}});
            let coefficient = exchangeCoefficient({exchange, fieldToCalculate: {$sum: ["$items.amount"]}})

            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            // selector.enterBillType = {$ne: 'saleOrder'};
            // if (params.so) {
            //     selector.enterBillType = {$eq: 'saleOrder'}
            // }
            selector.status = {$in: ['active', 'partial', 'closed']};
            if (params.date) {
                let dateAsArray = params.date.split(',')
                let fromDate = moment(dateAsArray[0]).toDate();
                let toDate = moment(dateAsArray[1]).toDate();
                data.title.date = moment(fromDate).format('YYYY-MMM-DD hh:mm a') + ' - ' + moment(toDate).format('YYYY-MMM-DD hh:mm a');
                data.title.exchange = `USD = ${coefficient.usd.$multiply[1]} $, KHR = ${coefficient.khr.$multiply[1]}<small> ៛</small>, THB = ${coefficient.thb.$multiply[1]} B`;
                selector.enterBillDate = {$gte: fromDate, $lte: toDate};
            }
            if (params.vendor && params.vendor != '') {
                selector.vendorId = params.vendor;
            }
            data.fields = [
                {field: '<th>Date</th>'},
                {field: '<th>INVN</th>'},
                {field: '<th>Name</th>'},
                {field: '<th>Addr</th>'},
                {field: '<th>Tel</th>'},
                {field: '<th>Item</th>'},
                {field: '<th class="text-center">Qty</th>'},
                {field: '<th class="text-center">Price</th>'},
                {field: '<th class="text-center">Amount</th>'}];
            data.displayFields = [
                {field: 'date'},
                {field: 'enterBillId'},
                {field: 'vendor'},
                {field: 'address'},
                {field: 'tel'},
                {field: 'itemName'},
                {field: 'qty'},
                {field: 'price'},
                {field: 'amount'}];

            // project['$enterBill'] = 'Invoice';
            /****** Title *****/
            data.title.company = Company.findOne();
            /****** Content *****/
            let enterBills = EnterBills.aggregate([
                {
                    $match: selector
                },
                {$unwind: {path: '$items', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: "ppos_item",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {$match: {'items.itemId': filterItem}},
                {
                    $group: {
                        _id: {
                            vendorId: '$vendorId',
                            itemId: '$items.itemId',
                            enterBillId: '$_id',
                        },
                        enterBillId: {$last: '$_id'},
                        date: {$last: '$enterBillDate'},
                        vendorId: {$last: '$vendorId'},
                        itemName: {$last: '$itemDoc.name'},
                        qty: {$sum: '$items.qty'},
                        price: {$sum: '$items.price'},
                        tsFee: {$sum: '$items.transportFee'},
                        tsFeeAmount: {$sum: {$multiply: ["$items.qty", "$items.transportFee"]}},
                        subAmount: {$sum: {$multiply: ["$items.qty", "$items.price"]}},
                        amount: {$sum: '$items.amount'},
                        total: {$last: '$total'},

                    }
                },
                {
                    $lookup: {
                        from: "ppos_vendors",
                        localField: "vendorId",
                        foreignField: "_id",
                        as: "vendorDoc"
                    }
                }, {
                    $unwind: {path: '$vendorDoc', preserveNullAndEmptyArrays: true}
                },
                {$sort: {'vendorDoc.name': 1}},

                {
                    $group: {
                        _id: '$vendorId',
                        items: {
                            $addToSet: {
                                enterBillId: '$enterBillId',
                                date: '$date',
                                vendor: '$vendorDoc.name',
                                tel: '$vendorDoc.telephone',
                                address: '$vendorDoc.address',
                                itemName: '$itemName',
                                qty: '$qty',
                                price: '$price',
                                tsFee: '$tsFee',
                                tsFeeAmount: '$tsFeeAmount',
                                subAmount: '$subAmount',
                                amount: '$amount'
                            }
                        },
                        tsFeeAmount: {$sum: '$tsFeeAmount'},
                        subAmount: {$sum: '$subAmount'},
                        totalQty: {$sum: '$qty'},
                    }
                },
                {
                    $sort: {'items.date': 1}
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: '$$ROOT'
                        },
                        totalQty: {$sum: '$totalQty'},
                        totalTsFeeAmount: {$sum: '$tsFeeAmount'},
                        totalSubAmount: {$sum: '$subAmount'},
                        total: {$sum:{$add: ['$tsFeeAmount', '$subAmount']}},
                    }
                }

            ]);
            let enterBillItemSummary = EnterBills.aggregate([
                {
                    $match: selector
                },
                {
                    $unwind: {path: '$items', preserveNullAndEmptyArrays: true}
                },
                {
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
                        _id: '$items.itemId',
                        itemName: {
                            $addToSet: '$itemDoc.name'
                        },
                        qty: {$sum: '$items.qty'},
                        subAmount: {
                            $sum: {
                                $multiply: [
                                    '$items.price',
                                    '$items.qty']
                            }
                        },
                        tsFeeAmount: {
                            $sum: {
                                $multiply: [
                                    '$items.transportFee',
                                    '$items.qty']
                            }
                        },
                        amount: {$sum: '$items.amount'}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        itemName: 1,
                        qty: 1,
                        subAmount: 1,
                        tsFeeAmount: 1,
                        amount: 1,
                        tsFee: {$divide: ["$tsFeeAmount", "$qty"]},
                        price: {$divide: ["$subAmount", "$qty"]}
                    }
                },
                {$unwind: {path: '$itemName', preserveNullAndEmptyArrays: true}},
                {$sort: {itemName: 1}}
            ]);
            if (enterBills.length > 0) {
                data.content = enterBills[0].data;
                data.footer = {
                    itemsSummary: enterBillItemSummary,
                    totalTsFeeAmount: enterBills[0].totalTsFeeAmount,
                    totalSubAmount: enterBills[0].totalSubAmount,
                    totalQty: enterBills[0].totalQty,
                    total: enterBills[0].total,
                    totalKhr: enterBills[0].totalKhr,
                    totalThb: enterBills[0].totalThb
                }
            }
            return data
        }
    }
});
