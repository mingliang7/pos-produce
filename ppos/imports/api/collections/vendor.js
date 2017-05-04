import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../ui/libs/select-opts.js';

export const Vendors = new Mongo.Collection("ppos_vendors");

Vendors.schema = new SimpleSchema({
    name: {
        type: String
    },
    repId: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.rep',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch};
                    }
                }
            }
        }
    },
    gender: {
        type: String,
        autoform: {
            type: "universe-select",
            afFieldInput: {
                uniPlaceholder: 'Select One',
            },
            options: function () {
                return SelectOpts.gender();
            }
        }
    },
    address: {
        type: String,
        optional:true
    },
    telephone: {
        type: String,
        optional:true
    },
    email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    paymentType: {
        type: String,
        autoform: {
            type: "universe-select",
            afFieldInput: {
                uniPlaceholder: 'Select One',
            },
            options: function () {
                return SelectOpts.paymentType();
            }
        }
    },
    termId: {
        type: String,
        optional: true,
        custom: function () {
            // let paymentType = AutoForm.getFieldValue('paymentType');
            if (this.field ('paymentType').value == "Term" && !this.isSet && (!this.operator || (this.value === null || this.value === ""))) {
                return "required";
            }
        },
        autoform: {
            type: "universe-select",
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.term',
                /*optionsMethodParams: function () {
                 if (Meteor.isClient) {
                 let currentBranch = Session.get('currentBranch');
                 return {branchId: currentBranch};
                 }
                 }*/
            }
        }
    },
    paymentGroupId: {
        type: String,
        optional:true,
        custom: function () {
            // let paymentType = AutoForm.getFieldValue('paymentType');
            if (this.field ('paymentType').value == "Group" && !this.isSet && (!this.operator || (this.value === null || this.value === ""))) {
                return "required";
            }
        },
        autoform: {
            type: "universe-select",
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.paymentGroup',
                /*optionsMethodParams: function () {
                 if (Meteor.isClient) {
                 let currentBranch = Session.get('currentBranch');
                 return {branchId: currentBranch};
                 }
                 }*/
            }
        }
    },
    branchId: {
        type: String,
        optional: true
    }
});

Meteor.startup(function () {
    Vendors.schema.i18n("ppos.vendor.schema");
    Vendors.attachSchema(Vendors.schema);
});
