import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../ui/libs/select-opts.js';

export const PrepaidOrders = new Mongo.Collection("ppos_prepaidOrders");

// Items sub schema
PrepaidOrders.itemsSchema = new SimpleSchema({
    itemId: {
        type: String
    },
    qty: {
        type: Number,
        decimal: true,min: 0
    },
    price: {
        type: Number,
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    amount: {
        type: Number,
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    remainQty: {
        type: Number,
        decimal: true
    }
});

// PrepaidOrders schema
PrepaidOrders.schema = new SimpleSchema({
    prepaidOrderDate: {
        type: Date,
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY HH:mm',

                }
            },
            value(){
                let vendorId = AutoForm.getFieldValue('vendorId');
                if (vendorId) {
                    return moment().toDate();
                }
            }
        }
    },
    voucherId: {
        type: String,
        optional: true
    },
    vendorId: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'ppos.selectOptMethods.vendor',
                optionsMethodParams: function () {
                    /* if (Meteor.isClient) {

                     let currentBranch = Session.get('currentBranch');
                     return {branchId: currentBranch};
                     }*/
                }
            }
        }
    },
    des: {
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor', // optional
                settings: {
                    height: 150,                 // set editor height
                    minHeight: null,             // set minimum height of editor
                    maxHeight: null,             // set maximum height of editor
                    toolbar: [
                        ['font', ['bold', 'italic', 'underline', 'clear']], //['font', ['bold', 'italic', 'underline', 'clear']],
                        ['para', ['ul', 'ol']] //['para', ['ul', 'ol', 'paragraph']],
                        //['insert', ['link', 'picture']], //['insert', ['link', 'picture', 'hr']],
                    ]
                } // summernote options goes here
            }
        }
    },
    items: {
        type: [PrepaidOrders.itemsSchema],
    },
    total: {
        type: Number,
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    branchId: {
        type: String
    },
    status: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                return 'active';
            }
        }
    },
    sumRemainQty: {
        type: Number,
        decimal: true,
        optional: true
    }
});

Meteor.startup(function () {
    PrepaidOrders.itemsSchema.i18n("ppos.prepaidOrder.schema");
    PrepaidOrders.schema.i18n("ppos.prepaidOrder.schema");
    PrepaidOrders.attachSchema(PrepaidOrders.schema);
});
