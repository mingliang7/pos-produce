import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';


export const saleOrderReportSchema = new SimpleSchema({
    type: {
        type: String,
        autoform: {
            type: 'select-radio-inline',
            options(){
                return [
                    {label: 'All', value: 'all'},
                    {label: 'Active & Partial', value: 'active'}
                ]
            }
        }
    },
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