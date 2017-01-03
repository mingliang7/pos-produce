import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';
import {PurchaseOrderPayment} from '../../imports/api/collections/purchaseOrderPayment';
import {Item} from '../../imports/api/collections/item.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js'
import {Vendors} from '../../imports/api/collections/vendor.js'

PurchaseOrderPayment.before.insert(function (userId, doc) {
    doc._id = idGenerator.genWithPrefix(PurchaseOrderPayment, `${doc.branchId}-`, 9);
});


PurchaseOrderPayment.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            data.type = "PayPurchaseOrder";
            let apChartAccount = AccountMapping.findOne({name: 'A/P PO'});
            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
            let purchaseDiscountChartAccount = AccountMapping.findOne({name: 'PO Discount'});
            let discountAmount = doc.dueAmount * doc.discount / 100;
            data.total = doc.paidAmount + discountAmount;

            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
            if (vendorDoc) {
                data.name = vendorDoc.name;
                data.des = data.des == "" || data.des == null ? ('បង់ប្រាក់ឱ្យក្រុមហ៊ុនៈ ' + data.name) : data.des;
            }

            transaction.push({
                account: apChartAccount.account,
                dr: doc.paidAmount + discountAmount,
                cr: 0,
                drcr: doc.paidAmount + discountAmount
            }, {
                account: cashChartAccount.account,
                dr: 0,
                cr: doc.paidAmount,
                drcr: -doc.paidAmount
            });
            if (discountAmount > 0) {
                transaction.push({
                    account: purchaseDiscountChartAccount.account,
                    dr: 0,
                    cr: discountAmount,
                    drcr: -discountAmount
                });
            }
            /*  let invoice = Invoices.findOne(doc.invoiceId);
             let firstItem = invoice.items[0];
             let itemDoc = Item.findOne(firstItem.itemId);
             invoice.items.forEach(function (item) {
             let itemDoc = Item.findOne(item.itemId);
             if (itemDoc.accountMapping.accountReceivable && itemDoc.accountMapping.inventoryAsset) {
             transaction.push({
             account: itemDoc.accountMapping.accountReceivable,
             dr: item.amount,
             cr: 0,
             drcr: item.amount
             }, {
             account: itemDoc.accountMapping.inventoryAsset,
             dr: 0,
             cr: item.amount,
             drcr: -item.amount
             })
             }
             });*/
            data.transaction = transaction;
            data.journalDate = data.paymentDate;
            Meteor.call('insertAccountJournal', data);
            console.log(data);
        }
        //End Account Integration
    });
});

PurchaseOrderPayment.after.update(function (userId, doc) {
    Meteor.defer(function () {
        console.log(doc);
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            data.type = "PayPurchaseOrder";
            let apChartAccount = AccountMapping.findOne({name: 'A/P PO'});
            let cashChartAccount = AccountMapping.findOne({name: 'Cash on Hand'});
            let purchaseDiscountChartAccount = AccountMapping.findOne({name: 'PO Discount'});
            let discountAmount = doc.dueAmount * doc.discount / 100;
            data.total = doc.paidAmount + discountAmount;

            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
            if (vendorDoc) {
                data.name = vendorDoc.name;
                data.des = data.des == "" || data.des == null ? ('បង់ប្រាក់ឱ្យក្រុមហ៊ុនៈ ' + data.name) : data.des;
            }

            transaction.push({
                account: apChartAccount.account,
                dr: doc.paidAmount + discountAmount,
                cr: 0,
                drcr: doc.paidAmount + discountAmount
            }, {
                account: cashChartAccount.account,
                dr: 0,
                cr: doc.paidAmount,
                drcr: -doc.paidAmount
            });
            if (discountAmount > 0) {
                transaction.push({
                    account: purchaseDiscountChartAccount.account,
                    dr: 0,
                    cr: discountAmount,
                    drcr: -discountAmount
                });
            }
            /*  let invoice = Invoices.findOne(doc.invoiceId);
             let firstItem = invoice.items[0];
             let itemDoc = Item.findOne(firstItem.itemId);
             invoice.items.forEach(function (item) {
             let itemDoc = Item.findOne(item.itemId);
             if (itemDoc.accountMapping.accountReceivable && itemDoc.accountMapping.inventoryAsset) {
             transaction.push({
             account: itemDoc.accountMapping.accountReceivable,
             dr: item.amount,
             cr: 0,
             drcr: item.amount
             }, {
             account: itemDoc.accountMapping.inventoryAsset,
             dr: 0,
             cr: item.amount,
             drcr: -item.amount
             })
             }
             });*/
            data.transaction = transaction;
            data.journalDate = data.paymentDate;
            Meteor.call('updateAccountJournal', data);
        }
        //End Account Integration
    });
});

PurchaseOrderPayment.after.remove(function (userId, doc) {
    Meteor.defer(function () {
        Meteor.call('insertRemovedPoPayment', doc);
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: 'PayPurchaseOrder'};
            Meteor.call('removeAccountJournal', data);
        }
        //End Account Integration
    })
});
