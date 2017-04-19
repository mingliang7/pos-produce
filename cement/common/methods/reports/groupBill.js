import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {GroupBill} from '../../../imports/api/collections/groupBill';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
export const groupBillReport = new ValidatedMethod({
    name: 'cement.groupBillReport',
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
            let sortObj = {};
            let sortOrder = params.sortOrder && parseInt(params.sortOrder) || 1;
            let user = Meteor.users.findOne(Meteor.userId());
            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            if (params.status) {
                selector.status = {$in: params.status.split(',')};
            }
            if (params.vendor && params.vendor != '') {
                selector.vendorOrCustomerId = params.vendor;
            }
            if (params.date) {
                let dateAsArray = params.date.split(',');
                let fromDate = moment(dateAsArray[0]).toDate();
                let toDate = moment(dateAsArray[1]).toDate();
                data.title.date = moment(fromDate).format('YYYY-MMM-DD') + ' - ' + moment(toDate).format('YYYY-MMM-DD');
                selector.startDate = {$lte: toDate};
                selector.endDate = {$gte: fromDate};
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
                    'startDate': '$startDate',
                    'endDate': '$endDate',
                    'status': '$status',
                    'vendor': '$vendorDoc',
                    'total': '$total'
                };
                data.fields = [{field: '#ID'}, {field: 'Vendor'}, {field: 'Start Date'}, {field: 'End Date'}, {field: 'Status'}, {field: 'Total'}];
                data.displayFields = [{field: '_id'}, {field: 'vendor'}, {field: 'startDate'}, {field: 'endDate'}, {field: 'status'}, {field: 'total'}];
            }

            /****** Title *****/
            data.title.company = Company.findOne();
            /****** Content *****/
            if (params.sortBy) {
                sortObj[`invoices.${params.sortBy}`] = sortOrder;
            } else {
                sortObj = {_id: sortOrder}
            }
            let groups = GroupBill.aggregate([
                {
                    $match: selector
                },
                {$unwind: {path: '$invoices', preserveNullAndEmptyArrays: true}},
                {$unwind: {path: '$invoices.items', preserveNullAndEmptyArrays: true}},
                {
                    $lookup: {
                        from: 'cement_item',
                        localField: 'invoices.items.itemId',
                        foreignField: '_id',
                        as: 'invoices.items.itemDoc'
                    }
                },
                {$unwind: {path: '$invoices.items.itemDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: {_id: '$_id', invoiceId: '$invoices._id'},
                        vendorOrCustomerId: {$last: '$vendorOrCustomerId'},
                        startDate: {$last: '$startDate'},
                        endDate: {$last: '$endDate'},
                        total: {$last: '$total'},
                        status: {$last: '$status'},
                        invoices: {
                            $last: {
                                _id: '$invoices._id',
                                voucherId: '$invoices.voucherId',
                                invoiceId: '$invoices.invoiceId',
                                enterBillDate: '$invoices.enterBillDate',
                                total: '$invoices.total'
                            }
                        },
                        items: {$push: '$invoices.items'}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        vendorOrCustomerId: 1,
                        startDate: 1,
                        endDate: 1,
                        total: 1,
                        status: 1,
                        invoices: {
                            _id: 1,
                            invoiceId: 1,
                            voucherId: {$ifNull: ["$invoices.voucherId", "$invoices._id"]},
                            enterBillDate: 1,
                            total: 1,
                            items: '$items'
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id._id',
                        vendorOrCustomerId: {$last: '$vendorOrCustomerId'},
                        startDate: {$last: '$startDate'},
                        endDate: {$last: '$endDate'},
                        total: {$last: '$total'},
                        status: {$last: '$status'},
                        invoices: {$push: '$invoices'}
                    }
                },
                {
                    $lookup: {
                        from: "cement_vendors",
                        localField: "vendorOrCustomerId",
                        foreignField: "_id",
                        as: "vendorDoc"
                    }
                },
                {$unwind: {path: '$vendorDoc', preserveNullAndEmptyArrays: true}},
                {$unwind: {path: '$invoices', preserveNullAndEmptyArrays: true}},
                {$sort: sortObj},
                {
                    $group: {
                        _id: '$_id',
                        data: {
                            $addToSet: project
                        },
                        invoices: {
                            $push: '$invoices'
                        }
                    }
                },
                {$sort: {_id: 1}}
            ]);
            let total = GroupBill.aggregate([
                {
                    $match: selector
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$total'
                        }
                    }
                }]);
            if (groups.length > 0) {
                data.content = groups;
                data.footer.total = total[0].total;
            }
            return data
        }
    }
});
