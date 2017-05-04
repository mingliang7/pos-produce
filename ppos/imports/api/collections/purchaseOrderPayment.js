export const PurchaseOrderPayment = new Mongo.Collection('ppos_purchaseOrderPayment');
PurchaseOrderPayment.schema = new SimpleSchema({
    billId: {
        type: String
    },
    paymentDate: {
        type: Date
    },
    paidAmount: {
        type: Number,
        decimal: true
    },
    discount: {
        type: Number,
        decimal: true,
        optional: true
    },
    cod: {
        type: Number,
        decimal: true,
        optional: true
    },
    benefit: {
        type: Number,
        decimal: true,
        optional: true
    },
    dueAmount: {
        type: Number,
        decimal: true
    },
    balanceAmount: {
        type: Number,
        decimal: true
    },
    vendorId: {
        type: String
    },
    status: {
        type: String
    },
    staffId: {
        type: String
    },
    paymentType: {
        type: String,
        optional: true
    },
    branchId: {
        type: String,
        optional: true
    },
    voucherId: {
        type: String,
        optional: true
    }
});
PurchaseOrderPayment.attachSchema(PurchaseOrderPayment.schema);
