import {Meteor} from 'meteor/meteor'
import {Accounts} from 'meteor/accounts-base'
import {ValidatedMethod} from 'meteor/mdg:validated-method'
import {SimpleSchema} from 'meteor/aldeed:simple-schema'
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin'
// collection
import {EnterBills} from '../../imports/api/collections/enterBill.js'
import {PayBills} from '../../imports/api/collections/payBill.js'
import {Vendors} from '../../imports/api/collections/vendor'
import {GroupBill} from '../../imports/api/collections/groupBill'
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js';
// Check user password
export const payBill = new ValidatedMethod({
    name: 'cement.payBill',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        enterBillsObj: {
            type: Object, blackbox: true
        },
        paymentDate: {type: Date},
        branch: {type: String},
        voucherId: {type: String}
    }).validator(),
    run({enterBillsObj, paymentDate, branch, voucherId}) {
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
                }
                console.log(obj);
                let vendor = Vendors.findOne(obj.vendorId)
                obj.paymentType = vendor.termId ? 'term' : 'group'
                PayBills.insert(obj, function (err, res) {
                    if (!err) {
                        obj._id = res;
                        let setting = AccountIntegrationSetting.findOne()
                        if (setting && setting.integrate) {
                            let transaction = []
                            let data = obj
                            data.type = 'PayBill'
                            let apChartAccount = AccountMapping.findOne({name: 'A/P'})
                            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'})
                            let purchaseDiscountChartAccount = AccountMapping.findOne({name: 'Purchase Discount'})
                            let codPOChartAccount = AccountMapping.findOne({name: 'Vendor COD'})
                            let benefitPOChartAccount = AccountMapping.findOne({name: 'Vendor Benefit'})
                            // let discountAmount = obj.dueAmount * obj.discount / 100

                            let discount = obj.discount == null ? 0 : obj.discount
                            let cod = obj.cod == null ? 0 : obj.cod
                            let benefit = obj.benefit == null ? 0 : obj.benefit
                            data.total = obj.paidAmount + discount + cod + benefit

                            let vendorobj = Vendors.findOne({_id: obj.vendorId})
                            if (vendorobj) {
                                data.name = vendorobj.name
                                data.des = data.des == '' || data.des == null ? ('បង់ប្រាក់ឱ្យក្រុមហ៊ុនៈ ' + data.name) : data.des
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
                            })
                            if (discount > 0) {
                                transaction.push({
                                    account: purchaseDiscountChartAccount.account,
                                    dr: 0,
                                    cr: discount,
                                    drcr: -discount
                                })
                            }
                            if (cod > 0) {
                                transaction.push({
                                    account: codPOChartAccount.account,
                                    dr: 0,
                                    cr: cod,
                                    drcr: -cod
                                })
                            }
                            if (benefit > 0) {
                                transaction.push({
                                    account: benefitPOChartAccount.account,
                                    dr: 0,
                                    cr: benefit,
                                    drcr: -benefit
                                })
                            }
                            data.transaction = transaction
                            data.journalDate = data.paymentDate
                            Meteor.call('insertAccountJournal', data)
                        }
                    }
                })
                if (obj.status == 'closed') {
                    selector.$set = {status: 'closed', closedAt: obj.paymentDate}
                } else {
                    selector.$set = {
                        status: 'partial'
                    }
                }
                if (vendor.termId) {
                    EnterBills.direct.update(k, selector)
                } else {
                    GroupBill.direct.update(k, selector)
                }
            }
            return true
        }
    }
})
