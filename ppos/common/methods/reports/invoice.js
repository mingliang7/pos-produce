import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/imports/api/collections/company.js';
import {Invoices} from '../../../imports/api/collections/invoice';
// lib func
import {correctFieldLabel} from '../../../imports/api/libs/correctFieldLabel';
export const invoiceReport = new ValidatedMethod({
    name: 'ppos.invoiceReport',
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
            // selector.invoiceType = {$ne: 'saleOrder'};
            if (params.date) {
                let dateAsArray = params.date.split(',')
                let fromDate = moment(dateAsArray[0]).startOf('days').toDate();
                let toDate = moment(dateAsArray[1]).endOf('days').toDate();
                data.title.date = moment(fromDate).format('YYYY-MMM-DD hh:mm a') + ' - ' + moment(toDate).format('YYYY-MMM-DD hh:mm a');
                selector.invoiceDate = {$gte: fromDate, $lte: toDate};
            }
            if (params.customer && params.customer != '') {
                selector.customerId = params.customer;
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
                data.fields.push({field: 'Total'}); //map total field for default data.displayFields.push({field: 'total'});
                data.fields.push({field: 'JournalId'}); //map total field for default data.displayFields.push({field: 'total'});
                project['total'] = '$total'; //get total projection for default } else {
                project['journalDoc'] = '$journalDoc'; //get total projection for default } else {
            }else{
                project = {
                    '_id': '$_id',
                    'invoiceDate': '$invoiceDate',
                    'customerId': '$customerId',
                    '_customer': '$_customer',
                    'status': '$status',
                    'total': '$total',
                    'journalDoc': '$journalDoc'
                };
                data.fields = [
                    {field: '#ID'},
                    {field: 'Date'}, 
                    {field: 'Customer'}, 
                    {field: 'Status'}, 
                    {field: 'Total'},
                    {field: 'JournalId'}
                    ];
                data.displayFields = [
                    {field: '_id'}, 
                    {field: 'invoiceDate'}, 
                    {field: 'customerId'}, 
                    {field: 'status'}, 
                    {field: 'total'},
                    {field: 'journalDoc'}
                    ];
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
            let invoices = Invoices.aggregate([
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
                        from: 'ppos_customers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: '_customer'
                    }
                },
                {
                    $unwind: {
                        preserveNullAndEmptyArrays: true,
                        path: '$_customer'
                    }
                },
                {
                    $sort: {invoiceDate: 1}
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $push: project
                        },
                        total: {
                            $sum: '$total'
                        }
                    }
                }]);
            if (invoices.length > 0) {
                data.content = invoices;
            }
            return data
        }
    }
});
