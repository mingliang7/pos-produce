import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
//collection
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment.js';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';
import {Vendors} from '../../imports/api/collections/vendor.js';
// Check user password
export const purchaseOrderPaymentMethod = new ValidatedMethod({
    name: 'cement.purchaseOrderPaymentMethod',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        enterBillsObj: {
            type: Object, blackbox: true
        },
        paymentDate: {type: Date},
        branch: {type: String},
        voucherId: {type: String}
    }).validator(),
    run({
        enterBillsObj, paymentDate, branch, voucherId
    }) {
        if (!this.isSimulation) {
            for (let k in enterBillsObj) {
                let selector = {}
                let obj = {
                    billId: k,
                    voucherId: voucherId,
                    paymentDate: paymentDate,
                    paidAmount: enterBillsObj[k].receivedPay,
                    dueAmount: enterBillsObj[k].dueAmount,
                    discount: enterBillsObj[k].discount || 0,
                    balanceAmount: enterBillsObj[k].dueAmount - enterBillsObj[k].receivedPay,
                    vendorId: enterBillsObj[k].vendorId || enterBillsObj[k].vendorOrCustomerId,
                    status: enterBillsObj[k].dueAmount - enterBillsObj[k].receivedPay == 0 ? 'closed' : 'partial',
                    staffId: Meteor.userId(),
                    branchId: branch
                };
                let vendor = Vendors.findOne(obj.vendorId);
                PurchaseOrderPayment.insert(obj);
                obj.status == 'closed' ? selector.$set = {status: 'closed'} : selector.$set = {status: 'partial'};
                PurchaseOrder.direct.update(k, selector)
            }
            return true;
        }
    }
});
