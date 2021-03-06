import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';
//lib
import StockFunction from '../../imports/api/libs/stock';
import EnterBillMutation from '../../imports/api/libs/enterBill';
// Collection
import {EnterBills} from '../../imports/api/collections/enterBill.js';
import {Invoices} from '../../imports/api/collections/invoice';
import {AverageInventories} from '../../imports/api/collections/inventory.js';
import {Item} from '../../imports/api/collections/item.js';
import {PrepaidOrders} from '../../imports/api/collections/prepaidOrder';
import {AccountMapping} from '../../imports/api/collections/accountMapping.js';
//import state
import {billState} from '../../common/globalState/enterBill';
import {GroupBill} from '../../imports/api/collections/groupBill.js'
import {PayBills} from '../../imports/api/collections/payBill.js';
import {Vendors} from '../../imports/api/collections/vendor.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting.js';
EnterBills.before.insert(function (userId, doc) {
    let checkItems = [];
    doc.items.forEach(function (item) {
        if (item.isBill == false) {
            checkItems.push(item);
        }
    });

    let result = StockFunction.checkStockByLocation(doc.stockLocationId, checkItems);
    if (!result.isEnoughStock) {
        throw new Meteor.Error(result.message);
    }

    if (doc.termId) {
        doc.status = 'partial';
        doc.billType = 'term';
    } else {
        doc.status = 'partial';
        doc.billType = 'group';
    }
    let todayDate = moment().format('YYYYMMDD');
    let prefix = doc.branchId + "-" + todayDate;
    let tmpBillId = doc._id;
    doc._id = idGenerator.genWithPrefix(EnterBills, prefix, 4);
    billState.set(tmpBillId, {vendorId: doc.vendorId, billId: doc._id, total: doc.total});

});

EnterBills.before.update(function (userId, doc, fieldNames, modifier, options) {
    let postDoc = {itemList: []};
    if (modifier.$set.items) {
        modifier.$set.items.forEach(function (item) {
            if (item.isBill == false) {
                postDoc.itemList.push(item);
            }
        })
    }

    let checkItems = [];
    doc.items.forEach(function (item) {
        if (item.isBill == false) {
            checkItems.push(item);
        }
    });
    let stockLocationId = modifier.$set.stockLocationId;
    let data = {stockLocationId: doc.stockLocationId, items: checkItems};

    let result = StockFunction.checkStockByLocationWhenUpdate(stockLocationId, postDoc.itemList, data);
    if (!result.isEnoughStock) {
        throw new Meteor.Error(result.message);
    }
});

EnterBills.before.remove(function (userId, doc) {
    if (doc.invoiceId == null) {
        let result = StockFunction.checkStockByLocation(doc.stockLocationId, doc.items);
        if (!result.isEnoughStock) {
            throw new Meteor.Error(result.message);
        }
    }

});

EnterBills.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        if (doc.billType == 'group') {
            Meteor.call('ppos.generateInvoiceGroup', {doc});
        }
        if (doc.invoiceId) {
            //update invoice with refBillId
            EnterBillMutation.updateInvoiceRefBillId({doc});
            let newEnterBillItems = [];
            let totalUnBill = 0;
            let grandTotal = 0;
            doc.items.forEach(function (item) {
                if (item.isBill == false) {
                    item.price = StockFunction.minusAverageInventoryInsertAndReturnCostPrice(doc.branchId, item, doc.stockLocationId, 'invoice-bill', doc._id, doc.enterBillDate);
                    item.amount = item.price * item.qty;
                    totalUnBill += item.amount;
                }
                newEnterBillItems.push(item);
                grandTotal += item.amount;
            });
            EnterBills.direct.update(doc._id, {
                $set: {
                    items: newEnterBillItems,
                    grandTotal: grandTotal,
                    totalUnBill: totalUnBill
                }
            });
        } else {
            doc.items.forEach(function (item) {
                StockFunction.averageInventoryInsertForBill(doc.branchId, item, doc.stockLocationId, 'insert-bill', doc._id, doc.enterBillDate);
            });
        }
        //Account Integration
        if (doc.total > 0) {
            let setting = AccountIntegrationSetting.findOne();
            if (setting && setting.integrate) {
                let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});
                let apChartAccount = AccountMapping.findOne({name: 'A/P'});

                let transaction = [];
                let data = doc;

                let vendorDoc = Vendors.findOne({_id: doc.vendorId});
                if (vendorDoc) {
                    data.name = vendorDoc.name;
                    data.des = data.des == "" || data.des == null ? ("បញ្ជាទិញទំនិញពីៈ " + data.name) : data.des;
                }
                data.type = "EnterBill";
                transaction.push({
                    account: inventoryChartAccount.account,
                    dr: doc.total,
                    cr: 0,
                    drcr: doc.total,

                }, {
                    account: apChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total,
                });
                /* }
                 });*/
                data.transaction = transaction;
                data.journalDate = data.enterBillDate;
                Meteor.call('insertAccountJournal', data);
            }
        }
        //End Account Integration
    });
});

EnterBills.after.update(function (userId, doc, fieldNames, modifier, options) {
    let preDoc = this.previous;
    let type = {
        term: doc.billType == 'term',
        group: doc.billType == 'group'
    };
    if (type.group) {
        Meteor.defer(function () {
            removeBillFromGroup(preDoc);
            pushBillFromGroup(doc);
            recalculatePayment({preDoc, doc});
        });
    }
    else {
        Meteor.defer(function () {
            Meteor._sleepForMs(200);
            recalculatePayment({preDoc, doc});
        });
    }
    Meteor.defer(function () {
        if (doc.invoiceId) {
            EnterBillMutation.updateInvoiceRefBillId({doc});

            preDoc.items.forEach(function (preItem) {
                if (preItem.isBill == false) {
                    preItem.price = StockFunction.averageInventoryInsert(preDoc.branchId, preItem, preDoc.stockLocationId, 'enterBill', preDoc._id, preDoc.enterBillDate);
                }
            });

            let newEnterBillItems = [];
            doc.items.forEach(function (item) {
                if (item.isBill == false) {
                    item.price = StockFunction.minusAverageInventoryInsertAndReturnCostPrice(doc.branchId, item, doc.stockLocationId, 'invoice-bill', doc._id, doc.enterBillDate);
                    newEnterBillItems.push(item);
                }
            });
            EnterBills.direct.update(doc._id, {$set: {items: newEnterBillItems}});

        } else {
            Meteor._sleepForMs(200);
            let inventoryIdList = [];
            preDoc.items.forEach(function (preItem) {
                StockFunction.minusAverageInventoryInsertForBill(preDoc.branchId, preItem, preDoc.stockLocationId, 'reduce-from-bill', doc._id, preDoc.enterBillDate);
            });
            //reduceFromInventory(preDoc);
            doc.items.forEach(function (item) {
                StockFunction.averageInventoryInsertForBill(doc.branchId, item, doc.stockLocationId, 'enterBill', doc._id, doc.enterBillDate);
            });
        }
        //Account Integration
        if (doc.total > 0) {
            let setting = AccountIntegrationSetting.findOne();
            if (setting && setting.integrate) {
                let apChartAccount = AccountMapping.findOne({name: 'A/P'});
                let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});
                let transaction = [];
                let data = doc;
                data.type = "EnterBill";

                let vendorDoc = Vendors.findOne({_id: doc.vendorId});
                if (vendorDoc) {
                    data.name = vendorDoc.name;
                    data.des = data.des == "" || data.des == null ? ("បញ្ជាទិញទំនិញពីៈ " + data.name) : data.des;
                }

                /*data.items.forEach(function (item) {
                 let itemDoc = Item.findOne(item.itemId);
                 if (itemDoc.accountMapping.inventoryAsset && itemDoc.accountMapping.accountPayable) {
                 transaction.push({
                 account: itemDoc.accountMapping.inventoryAsset,
                 dr: item.amount,
                 cr: 0,
                 drcr: item.amount

                 }, {
                 account: itemDoc.accountMapping.accountPayable,
                 dr: 0,
                 cr: item.amount,
                 drcr: -item.amount
                 })
                 }
                 });*/
                transaction.push({
                    account: inventoryChartAccount.account,
                    dr: doc.total,
                    cr: 0,
                    drcr: doc.total,

                }, {
                    account: apChartAccount.account,
                    dr: 0,
                    cr: doc.total,
                    drcr: -doc.total,
                });
                data.transaction = transaction;
                data.journalDate = data.enterBillDate;
                Meteor.call('updateAccountJournal', data);
            }
            //End Account Integration
        }
    });
});

EnterBills.after.remove(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        let type = {
            term: doc.billType == 'term',
            group: doc.billType == 'group'
        };
        let inventoryIdList = [];
        if (type.group) {
            if (doc.invoiceId) {
                doc.items.forEach(function (item) {
                    if (item.isBill == false) {
                        StockFunction.averageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'enterBill', doc._id, moment().toDate());
                    }
                });
            } else {
                //reduceFromInventory(doc);
                doc.items.forEach(function (item) {
                    StockFunction.minusAverageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'reduce-from-bill', doc._id, moment().toDate());
                });
            }
            removeBillFromGroup(doc);
            let groupBill = GroupBill.findOne(doc.paymentGroupId);
            if (groupBill && groupBill.invoices.length <= 0) {
                GroupBill.direct.remove(doc.paymentGroupId);
            } else {
                recalculatePaymentAfterRemoved({doc});
            }
        } else {
            if (doc.invoiceId) {
                doc.items.forEach(function (item) {
                    if (item.isBill == false) {
                        StockFunction.averageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'enterBill', doc._id, moment().toDate());
                    }
                });
            } else {
                //  reduceFromInventory(doc);
                doc.items.forEach(function (item) {
                    let id = StockFunction.minusAverageInventoryInsert(doc.branchId, item, doc.stockLocationId, 'reduce-from-bill', doc._id, moment().toDate());
                    inventoryIdList.push(id);
                });
            }
        }
        Meteor.call('insertRemovedBill', doc);
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let data = {_id: doc._id, type: 'EnterBill'};
            Meteor.call('removeAccountJournal', data)
        }
        Invoices.direct.update({refBillId: doc._id}, {$unset: {refBillId: '',refBillDate:''}}, {multi: true});
        //End Account Integration
    });
});


function reduceFromInventory(enterBill) {
    //let enterBill = EnterBills.findOne(enterBillId);
    let prefix = enterBill.stockLocationId + '-';
    enterBill.items.forEach(function (item) {
        let inventory = AverageInventories.findOne({
            branchId: enterBill.branchId,
            itemId: item.itemId,
            stockLocationId: enterBill.stockLocationId
        }, {sort: {_id: -1}});

        if (inventory) {
            let newInventory = {
                _id: idGenerator.genWithPrefix(AverageInventories, prefix, 13),
                branchId: enterBill.branchId,
                stockLocationId: enterBill.stockLocationId,
                itemId: item.itemId,
                qty: item.qty,
                price: inventory.price,
                remainQty: inventory.remainQty - item.qty,
                coefficient: -1,
                type: 'enter-return',
                refId: enterBill._id
            };
            AverageInventories.insert(newInventory);
        }
        else {
            let thisItem = Item.findOne(item.itemId);
            let newInventory = {
                _id: idGenerator.genWithPrefix(AverageInventories, prefix, 13),
                branchId: enterBill.branchId,
                stockLocationId: enterBill.stockLocationId,
                itemId: item.itemId,
                qty: item.qty,
                price: thisItem.purchasePrice,
                remainQty: 0 - item.qty,
                coefficient: -1,
                type: 'enter-return',
                refId: enterBill._id
            };
            AverageInventories.insert(newInventory);
        }

    });

}
/*
 function payBillInsert(doc){
 let payObj={};
 payObj._id=idGenerator.genWithPrefix()
 }*/
//recalculate qty
function recalculateQty(preDoc) {
    Meteor._sleepForMs(200);
    let updatedFlag;
    preDoc.items.forEach(function (item) {
        PrepaidOrders.direct.update(
            {_id: preDoc.prepaidOrderId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': item.qty, sumRemainQty: item.qty}}
        ); //re sum remain qty
    });
}
//update qty
function updateQtyInPrepaidOrder(doc) {
    Meteor._sleepForMs(200);
    doc.items.forEach(function (item) {
        PrepaidOrders.direct.update(
            {_id: doc.prepaidOrderId, 'items.itemId': item.itemId},
            {$inc: {'items.$.remainQty': -item.qty, sumRemainQty: -item.qty}}
        )
    });
}
// update group invoice
function removeBillFromGroup(doc) {
    Meteor._sleepForMs(200);
    GroupBill.update({_id: doc.paymentGroupId}, {$pull: {invoices: {_id: doc._id}}, $inc: {total: -doc.total}});
}
function pushBillFromGroup(doc) {
    Meteor._sleepForMs(200);
    GroupBill.update({_id: doc.paymentGroupId}, {$addToSet: {invoices: doc}, $inc: {total: doc.total}});
}
//update payment
function recalculatePayment({doc, preDoc}) {
    let totalChanged = doc.total - preDoc.total;
    if (totalChanged != 0) {
        let billId = doc.paymentGroupId || doc._id;
        let receivePayment = PayBills.find({billId: billId});
        if (receivePayment.count() > 0) {
            PayBills.update({billId: billId}, {
                $inc: {
                    dueAmount: totalChanged,
                    balanceAmount: totalChanged
                }
            }, {multi: true});
            PayBills.remove({billId: billId, dueAmount: {$lte: 0}});
        }
    }
}
//update payment after remove
function recalculatePaymentAfterRemoved({doc}) {
    let totalChanged = -doc.total;
    if (totalChanged != 0) {
        let billId = doc.paymentGroupId;
        let receivePayment = PayBills.find({billId: billId});
        if (receivePayment.count() > 0) {
            PayBills.update({billId: billId}, {
                $inc: {
                    dueAmount: totalChanged,
                    balanceAmount: totalChanged
                }
            }, {multi: true});
            PayBills.direct.remove({billId: billId, dueAmount: {$lte: 0}});
        }
    }
}


Meteor.methods({
    insertAccountForBill(){
        let i = 1;
        let bills = EnterBills.find({});
        bills.forEach(function (doc) {

            //Account Integration
            if (doc.total > 0) {
                console.log(i++);
                let setting = AccountIntegrationSetting.findOne();
                if (setting && setting.integrate) {
                    let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});
                    let apChartAccount = AccountMapping.findOne({name: 'A/P'});

                    let transaction = [];
                    let data = doc;

                    let vendorDoc = Vendors.findOne({_id: doc.vendorId});
                    if (vendorDoc) {
                        data.name = vendorDoc.name;
                        data.des = data.des == "" || data.des == null ? ("បញ្ជាទិញទំនិញពីៈ " + data.name) : data.des;
                    }
                    data.type = "EnterBill";
                    transaction.push({
                        account: inventoryChartAccount.account,
                        dr: doc.total,
                        cr: 0,
                        drcr: doc.total,

                    }, {
                        account: apChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total,
                    });
                    /* }
                     });*/
                    data.transaction = transaction;
                    data.journalDate = data.enterBillDate;
                    Meteor.call('insertAccountJournal', data);
                }
            }

            //End Account Integration
        });
    },
    billUpdateInventoryWithoutInvoiceIds(){
        let i=1;
        let bills = EnterBills.find({invoiceId:{$exists:false}}, {sort: {enterBillDate: 1}});
        bills.forEach(function (doc) {
            console.log(i);
            i++;
            if (doc.invoiceId) {
                //update invoice with refBillId
                EnterBillMutation.updateInvoiceRefBillId({doc});
                let newEnterBillItems = [];
                let totalUnBill = 0;
                let grandTotal = 0;
                doc.items.forEach(function (item) {
                    if (item.isBill == false) {
                        item.price = StockFunction.minusAverageInventoryInsertAndReturnCostPrice(doc.branchId, item, doc.stockLocationId, 'invoice-bill', doc._id, doc.enterBillDate);
                        item.amount = item.price * item.qty;
                        totalUnBill += item.amount;
                    }
                    newEnterBillItems.push(item);
                    grandTotal += item.amount;
                });
                EnterBills.direct.update(doc._id, {
                    $set: {
                        items: newEnterBillItems,
                        grandTotal: grandTotal,
                        totalUnBill: totalUnBill
                    }
                });
            } else {
                doc.items.forEach(function (item) {
                    StockFunction.averageInventoryInsertForBill(doc.branchId, item, doc.stockLocationId, 'insert-bill', doc._id, doc.enterBillDate);
                });
            }


            if (doc.total > 0) {
                let setting = AccountIntegrationSetting.findOne();
                if (setting && setting.integrate) {
                    let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});
                    let apChartAccount = AccountMapping.findOne({name: 'A/P'});

                    let transaction = [];
                    let data = doc;

                    let vendorDoc = Vendors.findOne({_id: doc.vendorId});
                    if (vendorDoc) {
                        data.name = vendorDoc.name;
                        data.des = data.des == "" || data.des == null ? ("បញ្ជាទិញទំនិញពីៈ " + data.name) : data.des;
                    }
                    data.type = "EnterBill";
                    transaction.push({
                        account: inventoryChartAccount.account,
                        dr: doc.total,
                        cr: 0,
                        drcr: doc.total,

                    }, {
                        account: apChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total,
                    });
                    /* }
                     });*/
                    data.transaction = transaction;
                    data.journalDate = data.enterBillDate;
                    Meteor.call('insertAccountJournal', data);
                }
            }

        });
    },
    billUpdateInventoryWithInvoiceIds(){
        let i=1;
        let bills = EnterBills.find({},{sort: {_id: 1}});
        bills.forEach(function (doc) {
            console.log(i);
            i++;
            if (doc.invoiceId) {
                //update invoice with refBillId
                EnterBillMutation.updateInvoiceRefBillId({doc});
                let newEnterBillItems = [];
                let totalUnBill = 0;
                let grandTotal = 0;
                doc.items.forEach(function (item) {
                    if (item.isBill == false) {
                        item.price = StockFunction.minusAverageInventoryInsertAndReturnCostPrice(doc.branchId, item, doc.stockLocationId, 'invoice-bill', doc._id, doc.enterBillDate);
                        item.amount = item.price * item.qty;
                        totalUnBill += item.amount;
                    }
                    newEnterBillItems.push(item);
                    grandTotal += item.amount;
                });
                EnterBills.direct.update(doc._id, {
                    $set: {
                        items: newEnterBillItems,
                        grandTotal: grandTotal,
                        totalUnBill: totalUnBill
                    }
                });
            } else {
                doc.items.forEach(function (item) {
                    StockFunction.averageInventoryInsertForBill(doc.branchId, item, doc.stockLocationId, 'insert-bill', doc._id, doc.enterBillDate);
                });
            }
            if (doc.total > 0) {
                let setting = AccountIntegrationSetting.findOne();
                if (setting && setting.integrate) {
                    let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});
                    let apChartAccount = AccountMapping.findOne({name: 'A/P'});

                    let transaction = [];
                    let data = doc;

                    let vendorDoc = Vendors.findOne({_id: doc.vendorId});
                    if (vendorDoc) {
                        data.name = vendorDoc.name;
                        data.des = data.des == "" || data.des == null ? ("បញ្ជាទិញទំនិញពីៈ " + data.name) : data.des;
                    }
                    data.type = "EnterBill";
                    transaction.push({
                        account: inventoryChartAccount.account,
                        dr: doc.total,
                        cr: 0,
                        drcr: doc.total,

                    }, {
                        account: apChartAccount.account,
                        dr: 0,
                        cr: doc.total,
                        drcr: -doc.total,
                    });
                    /* }
                     });*/
                    data.transaction = transaction;
                    data.journalDate = data.enterBillDate;
                    Meteor.call('insertAccountJournal', data);
                }
            }
        });
    }
});