import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';


export const paymentSchema = new SimpleSchema({
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
    customer: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'All',
                optionsMethod: 'cement.selectOptMethods.customer',
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
                        label: '#Invoice',
                        value: 'invoiceId'
                    },
                    {
                        label: 'Payment Type',
                        value: 'paymentType'
                    },
                    {
                        label: 'Customer',
                        value: 'customerId'
                    },
                    {
                        label: 'Date',
                        value: 'paymentDate'
                    },

                    {
                        label: 'Status',
                        value: 'status'
                    },
                    {
                        label: 'Penalty',
                        value: 'penalty'
                    },
                    {
                        label: 'Actual Amount',
                        value: 'actualDueAmount'
                    },
                    {
                        label: 'Discount',
                        value: 'discount'
                    }
                ]
            }
        }
    },
    sortBy: {
        type: String,
        autoform: {
            type: 'select-radio-inline',
            options(){
                return [
                    {label: 'ID',value: '_id'},
                    {label: 'Invoice', value: 'invoiceId'},
                    {label: 'Date', value: 'paymentDate'}
                ]
            }
        }
    }
});