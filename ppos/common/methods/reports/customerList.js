import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Customers} from '../../../imports/api/collections/customer';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
import ReportFn from "../../../imports/api/libs/report";
export const customerListReport = new ValidatedMethod({
    name: 'ppos.customerListReport',
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
            if (params.branchId) {
                branchId = params.branchId.split(',');
                selector.branchId = {
                    $in: branchId
                };
                selector = ReportFn.checkIfUserHasRights({currentUser: Meteor.userId(), selector});
            }
            let customers = Customers.aggregate([
                {
                    $match: selector
                },
                {
                    $group: {
                        _id: '$name',
                        countDuplicate: {$sum: 1},
                        customers: {
                            $push: '$$ROOT'
                        }
                    },

                },
                {
                    $sort: {_id: 1}
                },
                {
                    $project: {
                        _id: 1,
                        isDuplicated: {
                            $cond: [
                                {
                                    $gt: ["$countDuplicate", 1]
                                }, true, false
                            ]
                        },
                        customers: 1
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: '$$ROOT'
                        },
                        count: {$sum: 1}
                    }
                }
            ]);
            if (customers.length > 0) {
                data.content = customers[0].data;
                data.footer.count = customers[0].count;
            }
            return data;
        }
    }
});
