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
            let discountAmount = doc.dueAmount * doc.discount / 100;
            data.total = doc.paidAmount + discountAmount;

            let customerDoc = Customers.findOne({_id: doc.customerId});
            if (customerDoc) {
                data.name = customerDoc.name;
            }

            transaction.push({
                account: cashChartAccount.account,
                dr: doc.paidAmount,
                cr: 0,
                drcr: doc.paidAmount
            });
            if (discountAmount > 0) {
                transaction.push({
                    account: saleDiscountChartAccount.account,
                    dr: discountAmount,
                    cr: 0,
                    drcr: discountAmount
                });
            }
            transaction.push({
                account: arChartAccount.account,
                dr: 0,
                cr: doc.paidAmount + discountAmount,
                drcr: -doc.paidAmount + discountAmount
            });
            data.transaction = transaction;
            Meteor.call('insertAccountJournal', data);
            console.log(data);
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
            let discountAmount = doc.dueAmount * doc.discount / 100;
            data.total = doc.paidAmount + discountAmount;

            let customerDoc = Customers.findOne({_id: doc.customerId});
            if (customerDoc) {
                data.name = customerDoc.name;
            }

            transaction.push({
                account: cashChartAccount.account,
                dr: doc.paidAmount,
                cr: 0,
                drcr: doc.paidAmount
            });
            if (discountAmount > 0) {
                transaction.push({
                    account: saleDiscountChartAccount.account,
                    dr: discountAmount,
                    cr: 0,
                    drcr: discountAmount
                });
            }
            transaction.push({
                account: arChartAccount.account,
                dr: 0,
                cr: doc.paidAmount + discountAmount,
                drcr: -doc.paidAmount + discountAmount
            });
            data.transaction = transaction;
            Meteor.call('updateAccountJournal', data);
            console.log(data);
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
