import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
//collection
import {Invoices} from '../../imports/api/collections/invoice.js'
import {GroupInvoice} from '../../imports/api/collections/groupInvoice.js'
import {ReceivePayment} from '../../imports/api/collections/receivePayment.js';
import {Customers} from '../../imports/api/collections/customer';
// Check user password
export const receivePayment = new ValidatedMethod({
    name: 'cement.receivePayment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        invoicesObj: {
            type: Object, blackbox: true
        },
        currentPaymentDate: {type: Date},
        paymentDate: {type: Date},
        branch: {type: String},
        voucherId: {type: String}
    }).validator(),
    run({
        currentPaymentDate,
        invoicesObj, paymentDate, branch, voucherId
    }) {
        if (!this.isSimulation) {
            console.log(invoicesObj);
            for (let k in invoicesObj) {
                let selector = {};
                let currentDate = moment(currentPaymentDate).format('HH:mm:ss');
                let currentPaymentDate = moment(paymentDate).format('YYYY-MM-DD');
                let date = moment(currentPaymentDate + ' ' + currentDate).toDate();
                let obj = {
                    invoiceId: k,
                    voucherId: voucherId,
                    paymentDate: date,
                    paidAmount: invoicesObj[k].receivedPay,
                    penalty: invoicesObj[k].penalty,
                    discount: invoicesObj[k].discount || 0,
                    cod: invoicesObj[k].cod || 0,
                    benefit: invoicesObj[k].benefit || 0,
                    dueAmount: invoicesObj[k].dueAmount,
                    balanceAmount: invoicesObj[k].dueAmount - invoicesObj[k].receivedPay,
                    customerId: invoicesObj[k].customerId || invoicesObj[k].vendorOrCustomerId,
                    status: invoicesObj[k].dueAmount - invoicesObj[k].receivedPay == 0 ? 'closed' : 'partial',
                    staffId: Meteor.userId(),
                    branchId: branch
                };
                let customer = Customers.findOne(obj.customerId);
                obj.paymentType = customer.termId ? 'term' : 'group';
                ReceivePayment.insert(obj);
                if (obj.status == 'closed') {
                    selector.$set = {status: 'closed', closedAt: obj.paymentDate}
                } else {
                    selector.$set = {
                        status: 'partial',
                    };
                }
                if (customer.termId) {
                    Invoices.direct.update(k, selector)
                } else {
                    GroupInvoice.direct.update(k, selector);
                }
            }
            return true;
        }
    }
});
