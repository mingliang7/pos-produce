import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';
import {SelectOpts} from '../../../../../core/imports/ui/libs/select-opts.js';


export const VendorTermSchema = new SimpleSchema({
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
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: '(Select One)',
                optionsMethod: 'ppos.selectOptMethods.vendorByBranch',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {paymentType: {$eq: 'Term'}};
                    }
                }
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
});