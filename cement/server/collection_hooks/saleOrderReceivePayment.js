import {SaleOrderReceivePayment} from '../../imports/api/collections/saleOrderReceivePayment'
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js'
import {Customers} from '../../imports/api/collections/customer.js'

SaleOrderReceivePayment.before.insert(function (userId, doc) {
    doc._id = idGenerator.genWithPrefix(SaleOrderReceivePayment, `${doc.branchId}-`, 9);
});


SaleOrderReceivePayment.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            data.type = "SOReceivePayment";
            let arChartAccount = AccountMapping.findOne({name: 'A/R SO'});
            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
            let saleDiscountChartAccount = AccountMapping.findOne({name: 'SO Discount'});
            let codChartAccount = AccountMapping.findOne({name: 'Customer COD SO'});
            let benefitChartAccount = AccountMapping.findOne({name: 'Customer Benefit SO'});

            let discount = doc.discount == null ? 0 : doc.discount;
            let cod = doc.cod == null ? 0 : doc.cod;
            let benefit = doc.benefit == null ? 0 : doc.benefit;
            data.total = doc.paidAmount + discount + cod + benefit;

            let customerDoc = Customers.findOne({_id: doc.customerId});
            if (customerDoc) {
                data.name = customerDoc.name;
                data.des = data.des == "" || data.des == null ? ('ទទួលការបង់ប្រាក់ពីអតិថិជនៈ ' + data.name + '(SO)') : data.des;
            }

            transaction.push({
                account: cashChartAccount.account,
                dr: doc.paidAmount,
                cr: 0,
                drcr: doc.paidAmount
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
        //End Account Integration
    });
});

SaleOrderReceivePayment.after.update(function (userId, doc) {
    let preDoc = this.previous;
    let selector = {};
    if (doc.balanceAmount > 0) {
        SaleOrderReceivePayment.direct.update(doc._id, {$set: {status: 'partial'}});
    } else if (doc.balanceAmount < 0) {
        SaleOrderReceivePayment.direct.update(doc._id, {
            $set: {
                status: 'closed',
                paidAmount: doc.dueAmount,
                balanceAmount: 0
            }
        });
    }
    else {
        SaleOrderReceivePayment.direct.update(doc._id, {$set: {status: 'closed'}});
    }
    Meteor.defer(function () {
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            data.type = "SOReceivePayment";
            let arChartAccount = AccountMapping.findOne({name: 'A/R SO'});
            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
            let saleDiscountChartAccount = AccountMapping.findOne({name: 'SO Discount'});
            let codChartAccount = AccountMapping.findOne({name: 'Customer COD SO'});
            let benefitChartAccount = AccountMapping.findOne({name: 'Customer Benefit SO'});

            let discount = doc.discount == null ? 0 : doc.discount;
            let cod = doc.cod == null ? 0 : doc.cod;
            let benefit = doc.benefit == null ? 0 : doc.benefit;
            data.total = doc.paidAmount + discount + cod + benefit;

            let customerDoc = Customers.findOne({_id: doc.customerId});
            if (customerDoc) {
                data.name = customerDoc.name;
                data.des = data.des == "" || data.des == null ? ('ទទួលការបង់ប្រាក់ពីអតិថិជនៈ ' + data.name + '(SO)') : data.des;
            }

            transaction.push({
                account: cashChartAccount.account,
                dr: doc.paidAmount,
                cr: 0,
                drcr: doc.paidAmount
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
            Meteor.call('updateAccountJournal', data);
        }
        //End Account Integration
    });
});

SaleOrderReceivePayment.after.remove(function (userId, doc) {
    Meteor.defer(function () {
        //Account Integration
        Meteor.call('insertRemovedSoPayment', doc);
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: 'SOReceivePayment'};
            Meteor.call('removeAccountJournal', data);
        }
        //End Account Integration
    })
});


function updateInvoiceOrInvoiceGroup({_id, selector, collection}) {
    collection.direct.update(_id, selector);
}
