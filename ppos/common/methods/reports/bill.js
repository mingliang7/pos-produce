import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {EnterBills} from '../../../imports/api/collections/enterBill';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
export const billReport = new ValidatedMethod({
    name: 'ppos.billReport',
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
            let user = Meteor.users.findOne(Meteor.userId());
            // console.log(user);
            // let date = _.trim(_.words(params.date, /[^To]+/g));
            // selector.billType = {$ne: 'group'};
            selector.status = {$in: ['active', 'partial', 'closed']};
            if (params.date) {
                let dateAsArray = params.date.split(',')
                let fromDate = moment(dateAsArray[0]).toDate();
                let toDate = moment(dateAsArray[1]).toDate();
                data.title.date = moment(fromDate).format('YYYY-MMM-DD hh:mm a') + ' - ' + moment(toDate).format('YYYY-MMM-DD hh:mm a');
                selector.enterBillDate = {$gte: fromDate, $lte: toDate};
            }
            if (params.vendorId && params.vendorId != '') {
                selector.vendorId = params.vendorId;
            }
            if (params.filter && params.filter != '') {
                let filters = params.filter.split(','); //map specific field
                for (let i = 0; i < filters.length; i++) {
                    data.fields.push({field: correctFieldLabel(filters[i])});
                    data.displayFields.push({field: filters[i]});
                    project[filters[i]] = `$${filters[i]}`;
                    if (filters[i] == 'vendorId') {
                        project['_vendor'] = '$_vendor'
                    }
                }
                data.fields.push({field: 'Total'}); //map total field for default
                data.fields.push({field: 'JournalId'}); //map total field for default
                data.displayFields.push({field: 'total'});
                data.displayFields.push({field: 'journalDoc'});
                project['total'] = '$total'; //get total projection for default
                project['journalDoc'] = '$journalDoc'; //get total projection for default
            } else {
                project = {
                    '_id': '$_id',
                    'enterBillDate': '$enterBillDate',
                    'vendorId': '$vendorId',
                    '_vendor': '$_vendor',
                    'total': '$total',
                    'type': '$billType',
                    'journalDoc': '$journalDoc'
                };
                data.fields = [{field: '#ID'}, {field: 'Date'}, {field: 'Vendor'}, {field: 'Type'},{field: 'Total'},{field: 'JournalId'}];
                data.displayFields = [{field: '_id'}, {field: 'enterBillDate'},{field: 'vendorId'},{field: 'type'}, {field: 'total'},{field: 'journalDoc'}];
            }
            if(params.checkWithAccount == 'false'){
                data.displayFields = data.displayFields.filter(function(e){
                    return e.field != 'journalDoc';
                })
                data.fields = data.fields.filter(function(e){
                    return e.field != 'JournalId';                    
                })
            }

            /****** Title *****/
            data.title.company = Company.findOne();

            /****** Content *****/
            let bills = EnterBills.aggregate([
                {
                    $match: selector
                },
                {
                    $lookup: {
                        from: 'accJournal',
                        localField: '_id',
                        foreignField: 'refId',
                        as: 'journalDoc'
                    }
                },
                {
                    $lookup: {
                        from: 'ppos_vendors',
                        localField: 'vendorId',
                        foreignField: '_id',
                        as: '_vendor'
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: '$_vendor'
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $addToSet: project
                        },
                        total: {
                            $sum: '$total'
                        }
                    }
                }]);
            if (bills.length > 0) {
                let sortData = _.sortBy(bills[0].data, '_id');
                bills[0].data = sortData
                data.content = bills;
            }
            return data
        }
    }
});
