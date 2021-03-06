import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js'
// Collection
import {LendingStocks} from '../../imports/api/collections/lendingStock.js';
import {AverageInventories} from '../../imports/api/collections/inventory.js';
import {LendingInventories} from '../../imports/api/collections/lendingInventory.js';
import {Item} from '../../imports/api/collections/item.js';
import {Vendors} from '../../imports/api/collections/vendor.js';
import {PrepaidOrders} from '../../imports/api/collections/prepaidOrder';
//import state
import {GroupBill} from '../../imports/api/collections/groupBill.js'
import {PayBills} from '../../imports/api/collections/payBill.js';
import {AccountMapping} from '../../imports/api/collections/accountMapping';
LendingStocks.before.insert(function (userId, doc) {
    let todayDate = moment().format('YYYYMMDD');
    let prefix = doc.branchId + "-" + todayDate;
    let tmpBillId = doc._id;
    doc._id = idGenerator.genWithPrefix(LendingStocks, prefix, 4);
});

LendingStocks.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        lendingStockManageStock(doc);
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            data.type = "LendingStock";
            let lendingStockChartAccount = AccountMapping.findOne({name: 'Lending Stock'});
            let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});

            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
            if (vendorDoc) {
                data.name = vendorDoc.name;
                data.des = data.des == "" || data.des == null ? ('ក្រុមហ៊ុនៈ "' + data.name + '" ខ្ចីទំនិញ' ) : data.des;
            }

            transaction.push({
                account: lendingStockChartAccount.account,
                dr: doc.total,
                cr: 0,
                drcr: doc.total
            }, {
                account: inventoryChartAccount.account,
                dr: 0,
                cr: doc.total,
                drcr: -doc.total
            });
            data.transaction = transaction;
            data.journalDate = data.lendingStockDate;
            Meteor.call('insertAccountJournal', data);
        }
        //End Account Integration
    });
});

LendingStocks.after.update(function (userId, doc, fieldNames, modifier, options) {
    let preDoc = this.previous;
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        returnToInventoryAndLendingStock(preDoc);
        lendingStockManageStock(doc);
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            data.type = "LendingStock";
            let lendingStockChartAccount = AccountMapping.findOne({name: 'Lending Stock'});
            let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});

            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
            if (vendorDoc) {
                data.name = vendorDoc.name;
                data.des = data.des == "" || data.des == null ? ('ក្រុមហ៊ុនៈ "' + data.name + '" ខ្ចីទំនិញ' ) : data.des;
            }
            transaction.push({
                account: lendingStockChartAccount.account,
                dr: doc.total,
                cr: 0,
                drcr: doc.total
            }, {
                account: inventoryChartAccount.account,
                dr: 0,
                cr: doc.total,
                drcr: -doc.total
            });
            data.transaction = transaction;
            data.journalDate = data.lendingStockDate;
            Meteor.call('updateAccountJournal', data);
        }
        //End Account Integration
    })


});

LendingStocks.after.remove(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        returnToInventoryAndLendingStock(doc);
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: 'LendingStock'};
            Meteor.call('removeAccountJournal', data)
        }
        //End Account Integration
    });
});

function averageInventoryInsert(branchId, item, stockLocationId, type, refId) {
    let lastPurchasePrice = 0;
    let remainQuantity = 0;
    let prefix = stockLocationId + '-';
    let inventory = AverageInventories.findOne({
        branchId: branchId,
        itemId: item.itemId,
        stockLocationId: stockLocationId
    }, {sort: {createdAt: -1}});
    if (inventory == null) {
        let inventoryObj = {};
        inventoryObj._id = idGenerator.genWithPrefix(AverageInventories, prefix, 13);
        inventoryObj.branchId = branchId;
        inventoryObj.stockLocationId = stockLocationId;
        inventoryObj.itemId = item.itemId;
        inventoryObj.qty = item.qty;
        inventoryObj.price = item.price;
        inventoryObj.remainQty = item.qty;
        inventoryObj.type = type;
        inventoryObj.coefficient = 1;
        inventoryObj.refId = refId;
        lastPurchasePrice = item.price;
        remainQuantity = inventoryObj.remainQty;
        AverageInventories.insert(inventoryObj);
    }
    else if (inventory.price == item.price) {
        let inventoryObj = {};
        inventoryObj._id = idGenerator.genWithPrefix(AverageInventories, prefix, 13);
        inventoryObj.branchId = branchId;
        inventoryObj.stockLocationId = stockLocationId;
        inventoryObj.itemId = item.itemId;
        inventoryObj.qty = item.qty;
        inventoryObj.price = item.price;
        inventoryObj.remainQty = item.qty + inventory.remainQty;
        inventoryObj.type = type;
        inventoryObj.coefficient = 1;
        inventoryObj.refId = refId;
        lastPurchasePrice = item.price;
        remainQuantity = inventoryObj.remainQty;
        AverageInventories.insert(inventoryObj);
        /*
         let
         inventorySet = {};
         inventorySet.qty = item.qty + inventory.qty;
         inventorySet.remainQty = inventory.remainQty + item.qty;
         AverageInventories.update(inventory._id, {$set: inventorySet});
         */
    }
    else {
        let totalQty = inventory.remainQty + item.qty;
        let price = 0;
        //should check totalQty or inventory.remainQty
        if (totalQty <= 0) {
            price = inventory.price;
        } else if (inventory.remainQty <= 0) {
            price = item.price;
        } else {
            price = ((inventory.remainQty * inventory.price) + (item.qty * item.price)) / totalQty;
        }
        let nextInventory = {};
        nextInventory._id = idGenerator.genWithPrefix(AverageInventories, prefix, 13);
        nextInventory.branchId = branchId;
        nextInventory.stockLocationId = stockLocationId;
        nextInventory.itemId = item.itemId;
        nextInventory.qty = item.qty;
        nextInventory.price = math.round(price, 2);
        nextInventory.remainQty = totalQty;
        nextInventory.type = type;
        nextInventory.coefficient = 1;
        nextInventory.refId = refId;
        lastPurchasePrice = price;
        remainQuantity = nextInventory.remainQty;
        AverageInventories.insert(nextInventory);
    }

    var setModifier = {$set: {purchasePrice: lastPurchasePrice}};
    setModifier.$set['qtyOnHand.' + stockLocationId] = remainQuantity;
    Item.direct.update(item.itemId, setModifier);
}
function lendingStockManageStock(lendingStock) {
    // let lendingStock = LendingStocks.findOne(lendingStockId);
    let prefix = lendingStock.stockLocationId + "-";
    let lendingPrefix = lendingStock.branchId + '-';
    lendingStock.items.forEach(function (item) {
        //---Open Inventory type block "Average Inventory"---
        let inventory = AverageInventories.findOne({
            branchId: lendingStock.branchId,
            itemId: item.itemId,
            stockLocationId: lendingStock.stockLocationId
        }, {sort: {_id: -1}});
        if (inventory) {
            let newInventory = {
                _id: idGenerator.genWithPrefix(AverageInventories, prefix, 13),
                branchId: lendingStock.branchId,
                stockLocationId: lendingStock.stockLocationId,
                itemId: item.itemId,
                qty: item.qty,
                price: inventory.price,
                remainQty: inventory.remainQty - item.qty,
                coefficient: -1,
                type: 'lendingStock',
                refId: lendingStock._id
            };
            AverageInventories.insert(newInventory);
        }
        else {
            let thisItem = Item.findOne(item.itemId);
            let newInventory = {
                _id: idGenerator.genWithPrefix(AverageInventories, prefix, 13),
                branchId: lendingStock.branchId,
                stockLocationId: lendingStock.stockLocationId,
                itemId: item.itemId,
                qty: item.qty,
                price: thisItem.purchasePrice,
                remainQty: 0 - item.qty,
                coefficient: -1,
                type: 'lendingStock',
                refId: lendingStock._id
            };
            AverageInventories.insert(newInventory);
        }
        //--- End Inventory type block "Average Inventory"---

        //Manage Lending Stock
        /*let lendingInventory = LendingInventories.findOne({
         itemId: item.itemId,
         vendorId: lendingStock.vendorId,
         branchId: lendingStock.branchId
         });
         if (lendingInventory) {
         LendingInventories.update(
         lendingInventory._id,
         {
         $inc: {qty: item.qty}
         });
         } else {
         let newLendingStock = {
         _id: idGenerator.genWithPrefix(LendingInventories, lendingPrefix, 13),
         vendorId: lendingStock.vendorId,
         branchId: lendingStock.branchId,
         itemId: item.itemId,
         qty: item.qty
         };
         LendingInventories.insert(newLendingStock);
         }
         */
    });
}
function returnToInventoryAndLendingStock(lendingStock) {
    let lendingPrefix = lendingStock.branchId + '-';
    // let lendingStock = Invoices.findOne(lendingStockId);
    lendingStock.items.forEach(function (item) {
        //---Open Inventory type block "Average Inventory"---
        averageInventoryInsert(
            lendingStock.branchId,
            item,
            lendingStock.stockLocationId,
            'lendingStock-return',
            lendingStock._id
        );
        //--- End Inventory type block "Average Inventory"---

        //-- reduceFromLendingStock to lending stock---
        /* let lendingInventory = LendingInventories.findOne({
         itemId: item.itemId,
         vendorId: lendingStock.vendorId,
         branchId: lendingStock.branchId
         });
         let qty = -1 * item.qty;
         if (lendingInventory) {
         LendingInventories.update(
         lendingInventory._id,
         {
         $inc: {qty: qty}
         });
         } else {
         let newLendingStock = {
         _id: idGenerator.genWithPrefix(LendingInventories, lendingPrefix, 13),
         vendorId: lendingStock.vendorId,
         branchId: lendingStock.branchId,
         itemId: item.itemId,
         qty: qty
         };
         LendingInventories.insert(newLendingStock);
         }
         */

    });


}


