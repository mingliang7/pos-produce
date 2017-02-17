import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
//collection
import {Invoices} from '../../imports/api/collections/invoice.js'
import {GroupInvoice} from '../../imports/api/collections/groupInvoice.js'
import {TSPayment} from '../../imports/api/collections/tsPayment.js';
import {Customers} from '../../imports/api/collections/customer';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js';

// Check user password
export const tsPaymentFn = new ValidatedMethod({
    name: 'cement.tsPaymentFn',
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
                TSPayment.insert(obj, function (err,res) {
                    if (!err) {
                        obj._id=res;
                        let setting = AccountIntegrationSetting.findOne();
                        if (setting && setting.integrate) {
                            let transaction = [];
                            let data = obj;
                            data.type = "TSPayment";
                            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
                            let TPChartAccount = AccountMapping.findOne({name: 'Transport Payable'});
                            let customerDoc = Customers.findOne({_id: obj.customerId});
                            if (customerDoc) {
                                data.name = customerDoc.name;
                                data.des = data.des == "" || data.des == null ? ('ទទួលការបង់ប្រាក់ពីអតិថិជនៈ ' + data.name) : data.des;
                            }
                            transaction.push(
                                {
                                    account: cashChartAccount.account,
                                    dr: 0,
                                    cr: obj.paidAmount,
                                    drcr: -obj.paidAmount
                                },
                                {
                                    account: TPChartAccount.account,
                                    dr: obj.paidAmount,
                                    cr: 0,
                                    drcr: obj.paidAmount
                                },
                            );
                            data.transaction = transaction;
                            data.journalDate = data.paymentDate;
                            Meteor.call('insertAccountJournal', data);
                        }
                    }
                });
                if (obj.status == 'closed') {
                    selector.$set = {tsStatus: 'closed', closedTsAt: obj.paymentDate}
                } else {
                    selector.$set = {
                        tsStatus: 'partial',
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
