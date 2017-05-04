import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js'
//collection
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment.js';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';
import {Vendors} from '../../imports/api/collections/vendor.js';
// Check user password
export const purchaseOrderPaymentMethod = new ValidatedMethod({
    name: 'ppos.purchaseOrderPaymentMethod',
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
                    cod: enterBillsObj[k].cod || 0,
                    benefit: enterBillsObj[k].benefit || 0,
                    balanceAmount: enterBillsObj[k].dueAmount - enterBillsObj[k].receivedPay,
                    vendorId: enterBillsObj[k].vendorId || enterBillsObj[k].vendorOrCustomerId,
                    status: enterBillsObj[k].dueAmount - enterBillsObj[k].receivedPay == 0 ? 'closed' : 'partial',
                    staffId: Meteor.userId(),
                    branchId: branch
                };
                let vendor = Vendors.findOne(obj.vendorId);
                PurchaseOrderPayment.insert(obj, function (err,res) {
                    if (!err) {
                        obj._id=res;
                        //Account Integration
                        let setting = AccountIntegrationSetting.findOne();
                        if (setting && setting.integrate) {
                            let transaction = [];
                            let data = obj;
                            data.type = "PayPurchaseOrder";
                            let apChartAccount = AccountMapping.findOne({name: 'A/P PO'});
                            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
                            let purchaseDiscountChartAccount = AccountMapping.findOne({name: 'PO Discount'});
                            let codPOChartAccount = AccountMapping.findOne({name: 'Vendor COD PO'});
                            let benefitPOChartAccount = AccountMapping.findOne({name: 'Vendor Benefit PO'});
                            //let discountAmount = obj.dueAmount * obj.discount / 100;

                            let discount = obj.discount == null ? 0 : obj.discount;
                            let cod = obj.cod == null ? 0 : obj.cod;
                            let benefit = obj.benefit == null ? 0 : obj.benefit;
                            data.total = obj.paidAmount + discount + cod + benefit;

                            let vendorDoc = Vendors.findOne({_id: obj.vendorId});
                            if (vendorDoc) {
                                data.name = vendorDoc.name;
                                data.des = data.des == "" || data.des == null ? ('បង់ប្រាក់ឱ្យក្រុមហ៊ុនៈ ' + data.name) : data.des;
                            }

                            transaction.push({
                                account: apChartAccount.account,
                                dr: data.total,
                                cr: 0,
                                drcr: data.total
                            }, {
                                account: cashChartAccount.account,
                                dr: 0,
                                cr: obj.paidAmount,
                                drcr: -obj.paidAmount
                            });
                            if (discount > 0) {
                                transaction.push({
                                    account: purchaseDiscountChartAccount.account,
                                    dr: 0,
                                    cr: discount,
                                    drcr: -discount
                                });
                            }
                            if (cod > 0) {
                                transaction.push({
                                    account: codPOChartAccount.account,
                                    dr: 0,
                                    cr: cod,
                                    drcr: -cod
                                });
                            }
                            if (benefit > 0) {
                                transaction.push({
                                    account: benefitPOChartAccount.account,
                                    dr: 0,
                                    cr: benefit,
                                    drcr: -benefit
                                });
                            }
                            data.transaction = transaction;
                            data.journalDate = data.paymentDate;
                            Meteor.call('insertAccountJournal', data);
                        }
                    }
                });
                if (obj.status == 'closed') {
                    selector.$set = {paymentStatus: 'closed', closedAt: obj.paymentDate}
                } else {
                    selector.$set = {
                        paymentStatus: 'partial',
                    };
                }
                PurchaseOrder.direct.update(k, selector)
            }
            return true;
        }
    }
});
