export const payBillSchema = new SimpleSchema({
    vendorBalance: {
        type: String,
        label: 'Vendor Balance',
        optional: true
    },
    decementitTo: {
        type: String,
        label: 'Decementit To',
        optional: true
    },
    amount: {
        type: Number,
        decimal: true,
        label: 'Amount',
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    exchangeRate: {
        type: String,
        label: 'Exchange 1USD = ',
        optional: true
    },
    paymentDate: {
        type: Date,
        defaultValue: moment().toDate(),
        label: 'Date',
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY HH:mm:ss'
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
    accountReceivable: {
        type: String,
        label: 'A/R Account',
        optional: true
    },
    voucherId: {
        type: String,
        optional: true,
        label: 'Voucher #'
    },
    vendorId: {
        type: String,
        label: 'Pay For',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
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
    paymentMethods: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                // optionsMethod: 'ppos.selectOptMethods.vendor',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch};
                    }
                }
            }
        }
    }
});
