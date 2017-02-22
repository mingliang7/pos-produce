export const receivePaymentSchema = new SimpleSchema({
    customerBalance: {
        type: String,
        label: 'Customer Balance',
        optional: true
    },
    decementitTo: {
        type: String,
        label: 'Decementit To',
        optional: true
    },
    invoiceId: {
        type: String,
        label: 'Find by invoice ID#',
        optional: true
    },
    exchangeRate: {
        type: String,
        label: 'Exchange 1USD = ',
        optional: true
    },
    paymentDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY HH:mm:ss',
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
    accountReceivable: {
        type: String,
        label: 'A/R Account',
        optional: true
    },
    voucherId: {
        type: String,
        label: 'Invoice Number'
    },
    customerId: {
        type: String,
        label: 'Receive From',
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
    paymentMethods: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                // optionsMethod: 'cement.selectOptMethods.customer',
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
