import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';
import {SelectOpts} from '../../../../../core/imports/ui/libs/select-opts.js';


export const purchaseOrderDetailSchema = new SimpleSchema({
    status: {
        type: String,
        autoform: {
            type: 'select-radio-inline',
            options(){
                return [
                    {label: 'Active', value: 'active'},
                    {label: 'Closed', value: 'closed'}
                ]
            }
        }
    },
    filterDate: {
        type: Date,
        optional: true,
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'MM/YYYY',

                }
            }
        }
    },
    date: {
        type: Date,
        optional: true,
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
    purchaseOrder: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: '(Select One)',
                optionsMethod: 'ppos.selectOptMethods.purchaseOrderDetail',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let customerId = AutoForm.getFieldValue('customer');
                        let vendorId = AutoForm.getFieldValue('vendor');
                        let status = AutoForm.getFieldValue('status') || 'active';
                        if(vendorId && customerId) {
                            return {vendorId: vendorId, status: status , customerId: customerId};
                        }
                        return {};
                    }
                }
            }
        }
    },
    itemId: {
        type: String,
        autoform: {
            type: 'select'
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
                        label: 'Representative',
                        value: 'repId'
                    },
                    {
                        label: 'Date',
                        value: 'invoiceDate'
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