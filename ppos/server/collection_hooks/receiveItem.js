import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {ReceiveItems} from '../../imports/api/collections/receiveItem.js';
import {PurchaseOrder} from '../../imports/api/collections/purchaseOrder';
import {AverageInventories} from '../../imports/api/collections/inventory.js';
import {Item} from '../../imports/api/collections/item.js';
import {PrepaidOrders} from '../../imports/api/collections/prepaidOrder';
import {LendingStocks} from '../../imports/api/collections/lendingStock.js';
import {CompanyExchangeRingPulls} from '../../imports/api/collections/companyExchangeRingPull.js';
import {ExchangeGratis} from '../../imports/api/collections/exchangeGratis.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting';
import {Vendors} from '../../imports/api/collections/vendor.js';
//import state
import {receiveItemState} from '../../common/globalState/receiveItem';
import {GroupBill} from '../../imports/api/collections/groupBill.js'
import {AccountMapping} from '../../imports/api/collections/accountMapping.js'

ReceiveItems.before.insert(function (userId, doc) {
    let todayDate = moment().format('YYYYMMDD');
    let prefix = doc.branchId + "-" + todayDate;
    let tmpBillId = doc._id;
    doc._id = idGenerator.genWithPrefix(ReceiveItems, prefix, 4);
});

ReceiveItems.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        let setting = AccountIntegrationSetting.findOne();
        let transaction = [];
        let type = '';
        let total = 0;
        let totalLostAmount = 0;
        doc.items.forEach(function (item) {
            total += item.qty * item.price;
            totalLostAmount += item.lostQty * item.price;
        });
        doc.total = total;
        //Account Integration
        if (setting && setting.integrate) {
            let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory SO'});
            let lostInventoryChartAccount = AccountMapping.findOne({name: 'Lost Inventory'});

            transaction.push({
                account: inventoryChartAccount.account,
                dr: doc.total,
                cr: 0,
                drcr: doc.total
            });
            if (totalLostAmount > 0) {
                transaction.push({
                    account: lostInventoryChartAccount.account,
                    dr: totalLostAmount,
                    cr: 0,
                    drcr: totalLostAmount
                });
            }
        }
        doc.total = doc.total + totalLostAmount;
        if (doc.type == 'PrepaidOrder') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'PrepaidOrder-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing'});


                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            reducePrepaidOrder(doc);
        }
        else if (doc.type == 'LendingStock') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'LendingStock-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Lending Stock'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            reduceLendingStock(doc);
        }
        else if (doc.type == 'ExchangeGratis') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'Gratis-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Gratis Owing'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            reduceExchangeGratis(doc);
        }
        else if (doc.type == 'CompanyExchangeRingPull') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'RingPull-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Ring Pull Owing'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            reduceCompanyExchangeRingPull(doc);
        } else if (doc.type == 'PurchaseOrder') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'PurchaseOrder-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing PO'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            reducePurchaseOrder(doc);
        }
        else {
            throw Meteor.Error('Require Receive Item type');
        }
        /* doc.items.forEach(function (item) {
         averageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'receiveItem', doc._id);
         });*/


        //Account Integration
        if (setting && setting.integrate) {
            let data = doc;
            data.type = type;
            data.transaction = transaction;
            data.journalDate = data.receiveItemDate;
            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
            if (vendorDoc) {
                data.name = vendorDoc.name;
                data.des = data.des == "" || data.des == null ? ('ទទួលទំនិញពីក្រុមហ៊ុនៈ ' + data.name) : data.des;
            }

            Meteor.call('insertAccountJournal', data);
        }
        //End Account Integration

    });
});

ReceiveItems.after.update(function (userId, doc, fieldNames, modifier, options) {
    let preDoc = this.previous;
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        let setting = AccountIntegrationSetting.findOne();
        let transaction = [];
        let type = '';
        let totalLostAmount = 0;
        let total = 0;
        console.log(doc);
        doc.items.forEach(function (item) {
            total += item.qty * item.price;
            totalLostAmount += item.lostQty * item.price;
        });
        doc.total = total;
        //Account Integration
        if (setting && setting.integrate) {
            let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory SO'});
            let lostInventoryChartAccount = AccountMapping.findOne({name: 'Lost Inventory'});

            transaction.push({
                account: inventoryChartAccount.account,
                dr: doc.total,
                cr: 0,
                drcr: doc.total
            });
            if (totalLostAmount > 0) {
                transaction.push({
                    account: lostInventoryChartAccount.account,
                    dr: totalLostAmount,
                    cr: 0,
                    drcr: totalLostAmount
                });
            }
        }
        doc.total = doc.total + totalLostAmount;

        if (doc.type == 'PrepaidOrder') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'PrepaidOrder-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            increasePrepaidOrder(preDoc);
            reducePrepaidOrder(doc);
        } else if (doc.type == 'LendingStock') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'LendingStock-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Lending Stock'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            increaseLendingStock(preDoc);
            reduceLendingStock(doc);
        } else if (doc.type == 'ExchangeGratis') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'Gratis-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Gratis Owing'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            increaseExchangeGratis(preDoc);
            reduceExchangeGratis(doc);
        } else if (doc.type == 'CompanyExchangeRingPull') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'RingPull-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Ring Pull Owing'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            increaseCompanyExchangeRingPull(preDoc);
            reduceCompanyExchangeRingPull(doc);
        } else if (doc.type == 'PurchaseOrder') {
            //Account Integration
            if (setting && setting.integrate) {
                type = 'PurchaseOrder-RI';
                let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing PO'});
                transaction.push({
                    account: InventoryOwingChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total
                });
            }
            increasePurchaseOrder(preDoc);
            reducePurchaseOrder(doc);
        } else {
            throw Meteor.Error('Require Receive Item type');
        }
        /* reduceFromInventory(preDoc, 'receive-item-return');
        doc.items.forEach(function (item) {
            averageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'receiveItem', doc._id);
        });*/
        //Account Integration
        if (setting && setting.integrate) {
            let data = doc;
            data.type = type;
            data.transaction = transaction;
            data.journalDate = data.receiveItemDate;
            let vendorDoc = Vendors.findOne({_id: doc.vendorId});
            if (vendorDoc) {
                data.name = vendorDoc.name;
                data.des = data.des == "" || data.des == null ? ('ទទួលទំនិញពីក្រុមហ៊ុនៈ ' + data.name) : data.des;
            }
            Meteor.call('updateAccountJournal', data);
        }
        //End Account Integration

    });
});

ReceiveItems.after.remove(function (userId, doc) {
    let type = '';
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        if (doc.type == 'PrepaidOrder') {
            type = 'PrepaidOrder-RI';
            increasePrepaidOrder(doc);
        } else if (doc.type == 'LendingStock') {
            type = 'LendingStock-RI';
            increaseLendingStock(doc);
        } else if (doc.type == 'ExchangeGratis') {
            type = 'ExchangeGratis-RI';
            increaseExchangeGratis(doc);
        } else if (doc.type == 'CompanyExchangeRingPull') {
            type = 'CompanyExchangeRingPull-RI';
            increaseCompanyExchangeRingPull(doc);
        } else if (doc.type == 'PurchaseOrder') {
            type = 'PurchaseOrder-RI';
            increasePurchaseOrder(doc);
            let purchaseOrder = PurchaseOrder.findOne(doc.purchaseOrderId);
            if (purchaseOrder.sumRemainQty == 0) {
                PurchaseOrder.direct.update(purchaseOrder._id, {$set: {status: 'closed'}});
            } else {
                PurchaseOrder.direct.update(purchaseOrder._id, {$set: {status: 'active'}});
            }
        } else {
            throw Meteor.Error('Require Receive Item type');
        }


        // reduceFromInventory(doc, 'receive-item-return');
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: type};
            Meteor.call('removeAccountJournal', data)
        }
        //End Account Integration
    });
});

/*receive item type

 ----PrepaidOrder-----
 insert: increase AverageInventory and reduce from PrepaidOrder(doc)
 Note: (update the remain qty of prepaidOrder);
 update: reduce AverageInventory and increase the PrepaidOrder back(previous doc);
 increase AverageInventory and reduce from PrepaidOrder( doc)
 remove: reduce AverageInventory and Increase the PrepaidOrder back(doc)

 ----LendingStock-----
 insert: increase AverageInventory and reduce from LendingStock(doc)
 update: reduce AverageInventory and increase the LendingStock(previous doc)
 increase AverageInventory and reduce from LendingStock(doc)
 remove: reduce AverageInventory and increase the LendingStock(doc)

 ----Ring Pull----
 insert: increase AverageInventory and reduce from Ring Pull (doc)
 update: reduce AverageInventory and increase the Ring Pull(previous doc)
 increase AverageInventory and reduce from Ring Pull(doc)
 remove: reduce AverageInventory and increase teh Ring Pull(doc)

 ----Gratis----
 insert: increase AverageInventory and reduce from Gratis (doc)
 update: reduce AverageInventory and increase the Gratis(previous doc)
 increase AverageInventory and reduce from Gratis(doc)
 remove: reduce AverageInventory and increase the Gratis(doc)

 */

function reducePrepaidOrder(doc) {
    doc.items.forEach(function (item) {
        PrepaidOrders.direct.update(
            {
                _id: doc.prepaidOrderId,
                "items.itemId": item.itemId
            },
            {
                $inc: {
                    sumRemainQty: -item.qty,
                    "items.$.remainQty": -item.qty
                }
            });
    });
    let prepaidOrder = PrepaidOrders.findOne(doc.prepaidOrderId);
    if (prepaidOrder.sumRemainQty == 0) {
        PrepaidOrders.direct.update(prepaidOrder._id, {$set: {status: 'closed'}});
    } else {
        PrepaidOrders.direct.update(prepaidOrder._id, {$set: {status: 'active'}});
    }
}

function increasePrepaidOrder(preDoc) {
    let updatedFlag;
    preDoc.items.forEach(function (item) {
        PrepaidOrders.direct.update(
            {_id: preDoc.prepaidOrderId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': item.qty, sumRemainQty: item.qty}}
        ); //re sum remain qty
    });
}

function reduceLendingStock(doc) {
    doc.items.forEach(function (item) {
        LendingStocks.direct.update(
            {
                _id: doc.lendingStockId,
                "items.itemId": item.itemId
            },
            {
                $inc: {
                    sumRemainQty: -item.qty,
                    "items.$.remainQty": -item.qty
                }
            });
    });
    let lendingStock = LendingStocks.findOne(doc.lendingStockId);
    if (lendingStock.sumRemainQty == 0) {
        LendingStocks.direct.update(lendingStock._id, {$set: {status: 'closed'}});
    } else {
        LendingStocks.direct.update(lendingStock._id, {$set: {status: 'active'}});
    }
}

function increaseLendingStock(preDoc) {
    //let updatedFlag;
    preDoc.items.forEach(function (item) {
        LendingStocks.direct.update(
            {_id: preDoc.lendingStockId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': item.qty, sumRemainQty: item.qty}}
        ); //re sum remain qty
    });
}


function reduceCompanyExchangeRingPull(doc) {
    doc.items.forEach(function (item) {
        CompanyExchangeRingPulls.direct.update(
            {
                _id: doc.companyExchangeRingPullId,
                "items.itemId": item.itemId
            },
            {
                $inc: {
                    sumRemainQty: -item.qty,
                    "items.$.remainQty": -item.qty
                }
            });
    });
    let companyExchangeRingPull = CompanyExchangeRingPulls.findOne(doc.companyExchangeRingPullId);
    if (companyExchangeRingPull.sumRemainQty == 0) {
        CompanyExchangeRingPulls.direct.update(companyExchangeRingPull._id, {$set: {status: 'closed'}});
    } else {
        CompanyExchangeRingPulls.direct.update(companyExchangeRingPull._id, {$set: {status: 'active'}});
    }
}

function increaseCompanyExchangeRingPull(preDoc) {
    //let updatedFlag;
    preDoc.items.forEach(function (item) {
        CompanyExchangeRingPulls.direct.update(
            {_id: preDoc.companyExchangeRingPullId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': item.qty, sumRemainQty: item.qty}}
        ); //re sum remain qty
    });
}


function reduceExchangeGratis(doc) {
    doc.items.forEach(function (item) {
        ExchangeGratis.direct.update(
            {
                _id: doc.exchangeGratisId,
                "items.itemId": item.itemId
            },
            {
                $inc: {
                    sumRemainQty: -item.qty,
                    "items.$.remainQty": -item.qty
                }
            });
    });
    let exchangeGratis = ExchangeGratis.findOne(doc.exchangeGratisId);
    if (exchangeGratis.sumRemainQty == 0) {
        ExchangeGratis.direct.update(exchangeGratis._id, {$set: {status: 'closed'}});
    } else {
        ExchangeGratis.direct.update(exchangeGratis._id, {$set: {status: 'active'}});
    }
}
function reducePurchaseOrder(doc) {
    doc.items.forEach(function (item) {
        PurchaseOrder.direct.update(
            {
                _id: doc.purchaseOrderId,
                "items.itemId": item.itemId
            },
            {
                $inc: {
                    sumRemainQty: -item.qty,
                    "items.$.remainQty": -item.qty
                }
            });
    });
    let purchaseOrder = PurchaseOrder.findOne(doc.purchaseOrderId);
    console.log(doc);
    if (purchaseOrder.sumRemainQty == 0) {
        PurchaseOrder.direct.update(purchaseOrder._id, {$set: {status: 'closed'}});
    } else {
        PurchaseOrder.direct.update(purchaseOrder._id, {$set: {status: 'active'}});
    }
}

function increaseExchangeGratis(preDoc) {
    //let updatedFlag;
    preDoc.items.forEach(function (item) {
        ExchangeGratis.direct.update(
            {_id: preDoc.exchangeGratisId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': item.qty, sumRemainQty: item.qty}}
        ); //re sum remain qty
    });
}
function increasePurchaseOrder(preDoc) {
    //let updatedFlag;
    preDoc.items.forEach(function (item) {
        PurchaseOrder.direct.update(
            {_id: preDoc.purchaseOrderId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': item.qty, sumRemainQty: item.qty}}
        ); //re sum remain qty
    });
}

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
function reduceFromInventory(receiveItem, type) {
    //let receiveItem = ReceiveItems.findOne(receiveItemId);
    let prefix = receiveItem.stockLocationId + '-';
    receiveItem.items.forEach(function (item) {
        let inventory = AverageInventories.findOne({
            branchId: receiveItem.branchId,
            itemId: item.itemId,
            stockLocationId: receiveItem.stockLocationId
        }, {sort: {_id: -1}});

        if (inventory) {
            let newInventory = {
                _id: idGenerator.genWithPrefix(AverageInventories, prefix, 13),
                branchId: receiveItem.branchId,
                stockLocationId: receiveItem.stockLocationId,
                itemId: item.itemId,
                qty: item.qty,
                price: inventory.price,
                remainQty: inventory.remainQty - item.qty,
                coefficient: -1,
                type: type,
                refId: receiveItem._id
            };
            AverageInventories.insert(newInventory);
        } else {
            let thisItem = Item.findOne(item.itemId);
            let newInventory = {
                _id: idGenerator.genWithPrefix(AverageInventories, prefix, 13),
                branchId: receiveItem.branchId,
                stockLocationId: receiveItem.stockLocationId,
                itemId: item.itemId,
                qty: item.qty,
                price: thisItem.purchasePrice,
                remainQty: 0 - item.qty,
                coefficient: -1,
                type: type,
                refId: receiveItem._id
            };
            AverageInventories.insert(newInventory);
        }

    });

}
Meteor.methods({
    insertAccountForReceiveItem(){
        let i=1;
        let receiveItems = ReceiveItems.find({});
        receiveItems.forEach(function (doc) {
            console.log(i++);
            let setting = AccountIntegrationSetting.findOne();
            let transaction = [];
            let type = '';
            let total = 0;
            let totalLostAmount = 0;
            doc.items.forEach(function (item) {
                total += item.qty * item.price;
                totalLostAmount += item.lostQty * item.price;
            });
            doc.total = total;
            //Account Integration
            if (setting && setting.integrate) {
                let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory SO'});
                let lostInventoryChartAccount = AccountMapping.findOne({name: 'Lost Inventory'});

                transaction.push({
                    account: inventoryChartAccount.account,
                    dr: doc.total,
                    cr: 0,
                    drcr: doc.total
                });
                if (totalLostAmount > 0) {
                    transaction.push({
                        account: lostInventoryChartAccount.account,
                        dr: totalLostAmount,
                        cr: 0,
                        drcr: totalLostAmount
                    });
                }
            }
            doc.total = doc.total + totalLostAmount;
            if (doc.type == 'PrepaidOrder') {
                //Account Integration
                if (setting && setting.integrate) {
                    type = 'PrepaidOrder-RI';
                    let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing'});


                    transaction.push({
                        account: InventoryOwingChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total
                    });
                }

            }
            else if (doc.type == 'LendingStock') {
                //Account Integration
                if (setting && setting.integrate) {
                    type = 'LendingStock-RI';
                    let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Lending Stock'});
                    transaction.push({
                        account: InventoryOwingChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total
                    });
                }

            }
            else if (doc.type == 'ExchangeGratis') {
                //Account Integration
                if (setting && setting.integrate) {
                    type = 'Gratis-RI';
                    let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Gratis Owing'});
                    transaction.push({
                        account: InventoryOwingChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total
                    });
                }

            }
            else if (doc.type == 'CompanyExchangeRingPull') {
                //Account Integration
                if (setting && setting.integrate) {
                    type = 'RingPull-RI';
                    let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Ring Pull Owing'});
                    transaction.push({
                        account: InventoryOwingChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total
                    });
                }

            } else if (doc.type == 'PurchaseOrder') {
                //Account Integration
                if (setting && setting.integrate) {
                    type = 'PurchaseOrder-RI';
                    let InventoryOwingChartAccount = AccountMapping.findOne({name: 'Inventory Supplier Owing PO'});
                    transaction.push({
                        account: InventoryOwingChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total
                    });
                }

            }
            else {
                throw Meteor.Error('Require Receive Item type');
            }
            /* doc.items.forEach(function (item) {
             averageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'receiveItem', doc._id);
             });*/


            //Account Integration
            if (setting && setting.integrate) {
                let data = doc;
                data.type = type;
                data.transaction = transaction;
                data.journalDate = data.receiveItemDate;
                let vendorDoc = Vendors.findOne({_id: doc.vendorId});
                if (vendorDoc) {
                    data.name = vendorDoc.name;
                    data.des = data.des == "" || data.des == null ? ('ទទួលទំនិញពីក្រុមហ៊ុនៈ ' + data.name) : data.des;
                }

                Meteor.call('insertAccountJournal', data);
            }
            //End Account Integration

        });

    }
})