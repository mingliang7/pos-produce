import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../ui/libs/select-opts.js';

export const Order = new Mongo.Collection("cement_order");

// Items sub schema
Order.itemsSchema = new SimpleSchema({
    unitConvertId: {
        type: String,
        optional: true
    },
    itemId: {
        type: String
    },
    qty: {
        type: Number,
        decimal: true,
        min: 0
    },
    transportFee: {
        type: Number,
        decimal: true,
        min: 0
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
    },
    transportFeeAmount: {
        type: Number,
        decimal: true,
        optional: true
    },
    discount: {
        type: Number,
        decimal: true,
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    }
});

// Order schema
Order.schema = new SimpleSchema({
    orderDate: {
        type: Date,
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',

                }
            },
            value(){
                let customerId = AutoForm.getFieldValue('customerId');
                if (customerId) {
                    return moment().toDate();
                }
            }

        }
    },
    customerId: {
        type: String,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
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
        type: [Order.itemsSchema],
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
    subTotal: {
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
    paymentStatus: {
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
    },
    voucherId: {
        type: String,
        label: 'Voucher ID',
        optional: true
    },
    isPurchased: {
        type: Boolean,
        optional: true
    },
    vendorId: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'cement.selectOptMethods.vendor',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch};
                    }
                }
            }
        }
    },
    totalTransportFee: {
        type: Number,
        decimal: true,
        optional: true
    },
    discount: {
        type: Number,
        decimal: true,
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    printId: {
        type: String,
        optional: true
    },
    totalDiscount: {
        type: Number,
        decimal: true,
        optional: true,
    },
    closedAt: {
        type: Date,
        optional: true
    },
    tsStatus: {
        type: String,
        optional: true
    },
    closedTsAt: {
        type: Date,
        optional: true
    }
});

Meteor.startup(function () {
    Order.itemsSchema.i18n("cement.order.schema");
    Order.schema.i18n("cement.order.schema");
    Order.attachSchema(Order.schema);
});
