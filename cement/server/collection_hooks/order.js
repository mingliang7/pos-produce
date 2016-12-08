import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Order} from '../../imports/api/collections/order.js';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js'
import {Item} from '../../imports/api/collections/item.js'
import {Vendors} from '../../imports/api/collections/vendor.js'
import {AverageInventories} from '../../imports/api/collections/inventory.js'
import {AccountMapping} from '../../imports/api/collections/accountMapping.js'
import {SaleOrderReceivePayment} from '../../imports/api/collections/saleOrderReceivePayment';
Order.before.insert(function (userId, doc) {
    doc.totalTransportFee=0;
    doc.sumRemainQty=0;
    doc.items.forEach(function (item) {
        item.transportFeeAmount = item.qty * item.transportFee;
        doc.totalTransportFee += item.transportFeeAmount;
        doc.sumRemainQty += item.qty;
    });
    console.log(doc);
    let prefix = doc.customerId;
    doc._id = idGenerator.genWithPrefix(Order, prefix, 6);
});

Order.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set.totalTransportFee=0;
    modifier.$set.sumRemainQty=0;
    modifier.$set.items.forEach(function (item) {
        item.transportFeeAmount = item.qty * item.transportFee;
        modifier.$set.totalTransportFee += item.transportFeeAmount;
        modifier.$set.sumRemainQty += item.qty;
    });
    console.log(modifier.$set);
});

Order.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        /*  if (doc.isPurchased) {
         //Auto Purchase Order
         //let vendor = Vendors.findOne(doc.voucherId);
         let purchaseObj = {
         //repId: vendor.repId,
         vendorId: doc.voucherId,
         purchaseOrderDate: new Date(),
         des: 'From Sale Order: "' + doc._id + '"',
         branchId: doc.branchId,
         total: 0,
         items: [],
         saleOrderId: doc._id
         };
         doc.items.forEach(function (item) {
         let inventory = AverageInventories.findOne({
         branchId: doc.branchId,
         itemId: item.itemId,
         });
         if (inventory) {
         purchaseObj.items.push({
         itemId: item.itemId,
         price: inventory.price,
         qty: doc.qty,
         amount: doc.qty * inventory.price,
         });
         purchaseObj.total += doc.qty * inventory.price;
         } else {
         let thisItem = Item.findOne(item.itemId);
         purchaseObj.items.push({
         itemId: item.itemId,
         price: item.price,
         qty: doc.qty,
         amount: doc.qty * thisItem.purchasePrice,
         });
         purchaseObj.total += doc.qty * inventory.price;
         }
         });
         PurchaseOrder.insert(purchaseObj);

         }*/
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            let total= doc.total + doc.total;
            data.type = "SaleOrder";
            let ARChartAccount = AccountMapping.findOne({name: 'A/R'});
            let saleIncomeChartAccount = AccountMapping.findOne({name: 'Sale Income'});
            let oweInventoryChartAccount = AccountMapping.findOne({name: 'Owe Inventory Customer'});
            let COGSChartAccount = AccountMapping.findOne({name: 'COGS'});
            let transportRevChartAccount = AccountMapping.findOne({name: 'Transport Revenue'});
            let transportExpChartAccount = AccountMapping.findOne({name: 'Transport Expense'});
            let APChartAccount = AccountMapping.findOne({name: 'A/P'});
            transaction.push(
                {
                    account: ARChartAccount.account,
                    dr: data.total,
                    cr: 0,
                    drcr: data.total
                },
                {
                    account: saleIncomeChartAccount.account,
                    dr: 0,
                    cr: data.total - data.totalTransportFee,
                    drcr: -(data.total - data.totalTransportFee)
                },
                {
                    account: COGSChartAccount.account,
                    dr: data.total - data.totalTransportFee,
                    cr: 0,
                    drcr: data.total - data.totalTransportFee
                },
                {
                    account: oweInventoryChartAccount.account,
                    dr: 0,
                    cr: data.total - data.totalTransportFee,
                    drcr: -(data.total - data.totalTransportFee)
                },
                {
                    account: transportExpChartAccount.account,
                    dr: data.totalTransportFee,
                    cr: 0,
                    drcr: data.totalTransportFee,
                },
                {
                    account: transportRevChartAccount.account,
                    dr: 0,
                    cr: data.totalTransportFee,
                    drcr: -data.totalTransportFee,
                },
                {
                    account: APChartAccount.account,
                    dr: 0,
                    cr: data.totalTransportFee,
                    drcr: -data.totalTransportFee,
                }
            );
            data.transaction = transaction;
            data.total=total;
            Meteor.call('insertAccountJournal', data);
        }
        //End Account Integration
    });
});

Order.after.update(function (userId, doc) {
    Meteor.defer(function () {
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            let total= doc.total + doc.total;
            data.type = "SaleOrder";
            let ARChartAccount = AccountMapping.findOne({name: 'A/R'});
            let saleIncomeChartAccount = AccountMapping.findOne({name: 'Sale Income'});
            let oweInventoryChartAccount = AccountMapping.findOne({name: 'Owe Inventory Customer'});
            let COGSChartAccount = AccountMapping.findOne({name: 'COGS'});
            let transportRevChartAccount = AccountMapping.findOne({name: 'Transport Revenue'});
            let transportExpChartAccount = AccountMapping.findOne({name: 'Transport Expense'});
            let APChartAccount = AccountMapping.findOne({name: 'A/P'});
            transaction.push(
                {
                    account: ARChartAccount.account,
                    dr: data.total,
                    cr: 0,
                    drcr: data.total
                },
                {
                    account: saleIncomeChartAccount.account,
                    dr: 0,
                    cr: data.total - data.totalTransportFee,
                    drcr: -(data.total - data.totalTransportFee)
                },
                {
                    account: COGSChartAccount.account,
                    dr: data.total - data.totalTransportFee,
                    cr: 0,
                    drcr: data.total - data.totalTransportFee
                },
                {
                    account: oweInventoryChartAccount.account,
                    dr: 0,
                    cr: data.total - data.totalTransportFee,
                    drcr: -(data.total - data.totalTransportFee)
                },
                {
                    account: transportExpChartAccount.account,
                    dr: data.totalTransportFee,
                    cr: 0,
                    drcr: data.totalTransportFee,
                },
                {
                    account: transportRevChartAccount.account,
                    dr: 0,
                    cr: data.totalTransportFee,
                    drcr: -data.totalTransportFee,
                },
                {
                    account: APChartAccount.account,
                    dr: 0,
                    cr: data.totalTransportFee,
                    drcr: -data.totalTransportFee,
                }
            );
            data.transaction = transaction;
            data.total=total;
            Meteor.call('insertAccountJournal', data);
        }
        //End Account Integration
        /*if (doc.isPurchased) {
         //Auto Purchase Order
         //let vendor = Vendors.findOne(doc.voucherId);
         let purchaseObj = {
         //repId: vendor.repId,
         vendorId: doc.voucherId,
         purchaseOrderDate: new Date(),
         des: 'From Sale Order: "' + doc._id + '"',
         branchId: doc.branchId,
         total: 0,
         items: [],
         saleOrderId: doc._id
         };
         doc.items.forEach(function (item) {
         let inventory = AverageInventories.findOne({
         branchId: doc.branchId,
         itemId: item.itemId,
         });
         if (inventory) {
         purchaseObj.items.push({
         itemId: item.itemId,
         price: inventory.price,
         qty: doc.qty,
         amount: doc.qty * inventory.price,
         });
         purchaseObj.total += doc.qty * inventory.price;
         } else {
         let thisItem = Item.findOne(item.itemId);
         purchaseObj.items.push({
         itemId: item.itemId,
         price: item.price,
         qty: doc.qty,
         amount: doc.qty * thisItem.purchasePrice,
         });
         purchaseObj.total += doc.qty * inventory.price;
         }
         });
         PurchaseOrder.update({saleOrderId: doc._id}, {$set: purchaseObj});
         }*/
    });
});

Order.after.remove(function (userId, doc) {
    Meteor.defer(function () {
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: 'SaleOrder'};
            Meteor.call('removeAccountJournal', data)
        }
        //End Account Integration
        PurchaseOrder.remove({saleOrderId: doc._id});
    })

});
