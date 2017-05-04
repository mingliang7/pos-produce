import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';


export const purchaseOrderReportSchema = new SimpleSchema({
    asDate: {
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
                uniPlaceholder: '(Select One)',
                optionsMethod: 'ppos.selectOptMethods.vendorByBranch',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        return {paymentType: {$ne: 'Term'}};
                    }
                }
            }
        }
    },
    customer: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'All',
                optionsMethod: 'ppos.selectOptMethods.customer',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch};
                    }
                }
            }
        }
    },
    type: {
        type: String,
        autoform: { 
            type: 'select-radio-inline',
            options(){
                return [
                    {label: 'All', value: 'all'},
                    {label: 'Active & Partial', value: 'activeAndPartial'}
                ]
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
    }
});