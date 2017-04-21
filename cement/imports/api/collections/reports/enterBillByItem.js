import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';
import {SelectOpts} from "../../../../../core/imports/ui/libs/select-opts";


export const enterBillByItemSchema = new SimpleSchema({
    itemId: {
        type: String,
        label: 'Item',
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                create: true,
                uniPlaceholder: 'Select One',
                optionsMethod: 'cement.selectOptMethods.item',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        return { scheme: {} };
                    }
                }
            }
        }
    },
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
                optionsMethod: 'cement.selectOptMethods.vendor',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {paymentType: {$in: ['Term', 'Group']}};
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
    },
    branchId: {
        type: [String],
        optional: true,
        label: function () {
            return TAPi18n.__('core.welcome.branch');
        },
        autoform: {
            type: "universe-select",
            multiple: true,
            options: function () {
                return Meteor.isClient && SelectOpts.branchForCurrentUser(false);
            },
            afFieldInput: {
                value: function () {
                    return Meteor.isClient && Session.get('currentBranch');
                }
            }
        }
    },
    checkWithAccount: {
        type: Boolean,
        defaultValue: true,
        autoform: {
            type: 'boolean-select'
        }
    }
});