import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';


export const groupBillReportSchema = new SimpleSchema({
    fromDate: {
        type: Date,
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',

                }
            }
        }
    },
    toDate: {
        type: Date,
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',

                }
            }
        }
    },
    vendor: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'All',
                optionsMethod: 'ppos.selectOptMethods.vendor',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch};
                    }
                }
            }
        }
    },
    filter: {
        type: [String],
        optional: true,
        autoform: {
            type: 'universe-select',
            multiple: true,
            uniPlaceholder: 'All',
            options(){
                return [
                    {
                        label: '#ID',
                        value: '_id'
                    },
                    {
                        label: 'Vendor',
                        value: 'vendorId'
                    },
                    {
                        label: 'Date',
                        value: 'prepaidOrderDate'
                    },
                    {
                        label: 'Status',
                        value: 'status'
                    }
                ]
            }
        }
    },
    sortBy: {
        type: String,
        optional: true,
        autoform: {
            type: 'select',
            options(){
                return [
                    {label: 'ID', value: '_id'},
                    {label: 'Date', value: 'enterBillDate'},
                    {label: 'Amount', value: 'total'}
                ]
            }
        }
    },
    sortOrder: {
        type: String,
        optional: true,
        autoform: {
            type: 'select',
            options(){
                return [
                    {label: 'Asc', value: '1'},
                    {label: 'Desc', value: '-1'},
                ]
            }
        }
    },
    status: {
        type: [String],
        optional: true,
        autoform: {
            type: 'select-checkbox-inline',
            options(){
                return [
                    {label: 'Active',value: 'active'},
                    {label: 'Partial',value: 'partial'},
                    {label: 'Closed',value: 'closed'}
                ]
            }
        }
    }
});