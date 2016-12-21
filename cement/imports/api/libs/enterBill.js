import {Invoices} from '../collections/invoice';
export default  class EnterBillMutation {
    static updateInvoiceRefBillId({doc}) {
        if (doc.invoiceId && doc.invoiceId.length > 0) {
            for (let i = 0; i < doc.invoiceId.length; i++) {
                Invoices.direct.update({_id: doc.invoiceId[i]}, {$set: {refBillId: doc._id}});
            }
        }
    }
};