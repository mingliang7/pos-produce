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
            let codPOChartAccount = AccountMapping.findOne({name: 'Vendor COD PO'});
            let benefitPOChartAccount = AccountMapping.findOne({name: 'Vendor Benefit PO'});
            //let discountAmount = doc.dueAmount * doc.discount / 100;
            let discount = doc.discount == null ? 0 : doc.discount;
            let cod = doc.cod == null ? 0 : doc.cod;
            let benefit = doc.benefit == null ? 0 : doc.benefit;
            data.total = doc.paidAmount + discount + cod + benefit;

            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
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
                cr: doc.paidAmount,
                drcr: -doc.paidAmount
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
