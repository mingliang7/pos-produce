import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js';
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
                ReceivePayment.insert(obj,function(err,res){
                    if(!err){
                        obj._id=res;
                        let setting = AccountIntegrationSetting.findOne();
                        if (setting && setting.integrate) {
                            let transaction = [];
                            let data = obj;
                            data.type = "ReceivePayment";
                            let arChartAccount = AccountMapping.findOne({name: 'A/R'});
                            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
                            let saleDiscountChartAccount = AccountMapping.findOne({name: 'Sale Discount'});
                            let codChartAccount = AccountMapping.findOne({name: 'Customer COD'});
                            let benefitChartAccount = AccountMapping.findOne({name: 'Customer Benefit'});

                            let discount = obj.discount == null ? 0 : obj.discount;
                            let cod = obj.cod == null ? 0 : obj.cod;
                            let benefit = obj.benefit == null ? 0 : obj.benefit;
                            data.total = obj.paidAmount + discount + cod + benefit;
                            //let discountAmount = obj.dueAmount * obj.discount / 100;
                            //data.total = obj.paidAmount + discountAmount;

                            let customerDoc = Customers.findOne({_id: obj.customerId});
                            if (customerDoc) {
                                data.name = customerDoc.name;
                                data.des = data.des == "" || data.des == null ? ('ទទួលការបង់ប្រាក់ពីអតិថិជនៈ ' + data.name) : data.des;
                            }

                            transaction.push({
                                account: cashChartAccount.account,
                                dr: obj.paidAmount,
                                cr: 0,
                                drcr: obj.paidAmount
                            });
                            if (discount > 0) {
                                transaction.push({
                                    account: saleDiscountChartAccount.account,
                                    dr: discount,
                                    cr: 0,
                                    drcr: discount
                                });
                            }
                            if (cod > 0) {
                                transaction.push({
                                    account: codChartAccount.account,
                                    dr: cod,
                                    cr: 0,
                                    drcr: cod
                                });
                            }
                            if (benefit > 0) {
                                transaction.push({
                                    account: benefitChartAccount.account,
                                    dr: benefit,
                                    cr: 0,
                                    drcr: benefit
                                });
                            }

                            transaction.push({
                                account: arChartAccount.account,
                                dr: 0,
                                cr: data.total,
                                drcr: -data.total
                            });
                            data.transaction = transaction;
                            data.journalDate = data.paymentDate;
                            Meteor.call('insertAccountJournal', data);
                        }
                    }
                });
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
