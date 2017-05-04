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
import {Customers} from '../../imports/api/collections/customer.js'
import {SaleOrderReceivePayment} from '../../imports/api/collections/saleOrderReceivePayment';
Order.before.insert(function (userId, doc) {
    let totalDiscount = 0;
    doc.printId = doc._id;
    doc.totalTransportFee = 0;
    doc.sumRemainQty = 0;
    doc.items.forEach(function (item) {
        item.transportFeeAmount = item.qty * item.transportFee;
        doc.totalTransportFee += item.transportFeeAmount;
        doc.sumRemainQty += item.qty;
        if (item.discount) {
            totalDiscount += item.discount * item.qty;
        }
    });
    if (doc.discount) {
        totalDiscount += doc.discount;
    }
    doc.totalDiscount = totalDiscount;
    let prefix = doc.customerId;
    doc._id = idGenerator.genWithPrefix(Order, prefix, 6);
});

Order.before.update(function (userId, doc, fieldNames, modifier, options) {
    let totalDiscount = 0;
    modifier.$set.totalTransportFee = 0;
    modifier.$set.sumRemainQty = 0;
    modifier.$set.items.forEach(function (item) {
        item.transportFeeAmount = item.qty * item.transportFee;
        modifier.$set.totalTransportFee += item.transportFeeAmount;
        modifier.$set.sumRemainQty += item.qty;
        if (item.discount) {
            totalDiscount += item.discount * item.qty;
        }
    });
    if (modifier.$set.discount) {
        totalDiscount += modifier.$set.discount;
    }
    modifier.$set.totalDiscount = totalDiscount;
});

Order.after.insert(function (userId, doc) {
    Meteor.defer(function () {
        Meteor._sleepForMs(200);
        if (doc.isPurchased) {
            //Auto Purchase Order
            //let vendor = Vendors.findOne(doc.voucherId);
            let purchaseObj = {
                //repId: vendor.repId,
                vendorId: doc.vendorId,
                customerId: doc.customerId,
                purchaseOrderDate: doc.orderDate,
                des: 'From Sale Order: "' + doc._id + '"',
                branchId: doc.branchId,
                total: doc.total - doc.totalTransportFee,
                items: [],
                saleOrderId: doc._id,
                sumRemainQty: 0,
                status: 'active'
            };
            doc.items.forEach(function (item) {
                purchaseObj.sumRemainQty += item.qty;
                purchaseObj.items.push({
                    itemId: item.itemId,
                    price: item.price,
                    qty: item.qty,
                    remainQty: item.qty,
                    amount: item.qty * item.price,
                });
            });
            PurchaseOrder.insert(purchaseObj);
        }
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            let total = doc.total + doc.total;
            data.type = "SaleOrder";
            let ARChartAccount = AccountMapping.findOne({name: 'A/R SO'});
            let saleIncomeChartAccount = AccountMapping.findOne({name: 'Sale Income SO'});
            let transportRevChartAccount = AccountMapping.findOne({name: 'Transport Revenue'});
            let oweInventoryChartAccount = AccountMapping.findOne({name: 'Owe Inventory Customer SO'});
            let COGSChartAccount = AccountMapping.findOne({name: 'COGS SO'});
            let transportExpChartAccount = AccountMapping.findOne({name: 'Transport Expense'});
            let APChartAccount = AccountMapping.findOne({name: 'Transport Payable'});
            let saleDiscountChartAccount = AccountMapping.findOne({name: 'SO Discount'});

            let customerDoc = Customers.findOne({_id: doc.customerId});
            if (customerDoc) {
                data.name = customerDoc.name;
                data.des = data.des == "" || data.des == null ? ('កម្ម៉ង់ទិញទំនិញពីអតិថិជនៈ ' + data.name) : data.des;
            }


            transaction.push(
                {
                    account: ARChartAccount.account,
                    dr: data.total - data.totalDiscount,
                    cr: 0,
                    drcr: data.total - data.totalDiscount
                },
                {
                    account: saleIncomeChartAccount.account,
                    dr: 0,
                    cr: data.total - data.totalTransportFee,
                    drcr: -(data.total - data.totalTransportFee)
                },
            );
            if (data.totalTransportFee > 0) {
                transaction.push({
                        account: transportRevChartAccount.account,
                        dr: 0,
                        cr: data.totalTransportFee,
                        drcr: -data.totalTransportFee,
                    },
                );
            }

            transaction.push({
                    account: oweInventoryChartAccount.account,
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
            );
            if (data.totalTransportFee > 0) {
                transaction.push({
                        account: transportExpChartAccount.account,
                        dr: data.totalTransportFee,
                        cr: 0,
                        drcr: data.totalTransportFee,
                    },
                    {
                        account: APChartAccount.account,
                        dr: 0,
                        cr: data.totalTransportFee,
                        drcr: -data.totalTransportFee,
                    },
                );
            }
            if (data.totalDiscount > 0) {
                transaction.push({
                        account: saleDiscountChartAccount.account,
                        dr: data.totalDiscount,
                        cr: 0,
                        drcr: data.totalDiscount,
                    }
                );
            }
            data.transaction = transaction;
            data.total = total;
            data.journalDate = data.orderDate;
            Meteor.call('insertAccountJournal', data);
        }
        //End Account Integration
    });
});

Order.after.update(function (userId, doc) {
    Meteor.defer(function () {
        if (doc.isPurchased) {
            let purchaseOrder = PurchaseOrder.findOne({saleOrderId: doc._id});
            if (purchaseOrder) {
                let purchaseObj = {
                    //repId: vendor.repId,
                    vendorId: doc.vendorId,
                    customerId: doc.customerId,
                    purchaseOrderDate: doc.orderDate,
                    des: 'From Sale Order: "' + doc._id + '"',
                    branchId: doc.branchId,
                    total: doc.total - doc.totalTransportFee,
                    items: [],
                    saleOrderId: doc._id,
                    sumRemainQty: 0,
                    status: 'active'
                };
                doc.items.forEach(function (item) {
                    purchaseObj.sumRemainQty += item.qty;
                    purchaseObj.items.push({
                        itemId: item.itemId,
                        price: item.price,
                        qty: item.qty,
                        remainQty: item.qty,
                        amount: item.qty * item.price,

                    });
                });
                PurchaseOrder.update(purchaseOrder._id, {$set: purchaseObj});
            } else {
                let purchaseObj = {
                    vendorId: doc.vendorId,
                    purchaseOrderDate: doc.orderDate,
                    des: 'From Sale Order: "' + doc._id + '"',
                    branchId: doc.branchId,
                    total: doc.total - doc.totalTransportFee,
                    items: [],
                    saleOrderId: doc._id,
                    sumRemainQty: 0
                };
                doc.items.forEach(function (item) {
                    purchaseObj.sumRemainQty += item;
                    purchaseObj.items.push({
                        itemId: item.itemId,
                        price: item.price,
                        qty: item.qty,
                        remainQty: item.qty,
                        amount: item.qty * item.price,
                    });
                });
                PurchaseOrder.insert(purchaseObj);
            }
        }
        //Account Integration
        let setting = AccountIntegrationSetting.findOne();
        if (setting && setting.integrate) {
            let transaction = [];
            let data = doc;
            let total = doc.total + doc.total;
            data.type = "SaleOrder";
            let ARChartAccount = AccountMapping.findOne({name: 'A/R SO'});
            let saleIncomeChartAccount = AccountMapping.findOne({name: 'Sale Income SO'});
            let oweInventoryChartAccount = AccountMapping.findOne({name: 'Owe Inventory Customer SO'});
            let COGSChartAccount = AccountMapping.findOne({name: 'COGS SO'});
            let transportRevChartAccount = AccountMapping.findOne({name: 'Transport Revenue'});
            let transportExpChartAccount = AccountMapping.findOne({name: 'Transport Expense'});
            let APChartAccount = AccountMapping.findOne({name: 'Transport Payable'});
            let saleDiscountChartAccount = AccountMapping.findOne({name: 'SO Discount'});

            let customerDoc = Customers.findOne({_id: doc.customerId});
            if (customerDoc) {
                data.name = customerDoc.name;
                data.des = data.des == "" || data.des == null ? ('កម្ម៉ង់ទិញទំនិញពីអតិថិជនៈ ' + data.name) : data.des;
            }


            transaction.push(
                {
                    account: ARChartAccount.account,
                    dr: data.total - data.totalDiscount,
                    cr: 0,
                    drcr: data.total - data.totalDiscount
                },
                {
                    account: saleIncomeChartAccount.account,
                    dr: 0,
                    cr: data.total - data.totalTransportFee,
                    drcr: -(data.total - data.totalTransportFee)
                },
            );
            if (data.totalTransportFee > 0) {
                transaction.push({
                        account: transportRevChartAccount.account,
                        dr: 0,
                        cr: data.totalTransportFee,
                        drcr: -data.totalTransportFee,
                    },
                );
            }
            transaction.push({
                    account: oweInventoryChartAccount.account,
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
            );
            if (data.totalTransportFee > 0) {
                transaction.push({
                        account: transportExpChartAccount.account,
                        dr: data.totalTransportFee,
                        cr: 0,
                        drcr: data.totalTransportFee,
                    },

                    {
                        account: APChartAccount.account,
                        dr: 0,
                        cr: data.totalTransportFee,
                        drcr: -data.totalTransportFee,
                    },
                );
            }
            if (data.totalDiscount > 0) {
                transaction.push({
                        account: saleDiscountChartAccount.account,
                        dr: data.totalDiscount,
                        cr: 0,
                        drcr: data.totalDiscount,
                    }
                );
            }
            data.transaction = transaction;
            data.total = total;
            data.journalDate = data.orderDate;
            Meteor.call('updateAccountJournal', data);
        }
        //End Account Integration
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
        if (doc.isPurchased) {
            PurchaseOrder.remove({saleOrderId: doc._id});
        }
    })

});

Meteor.methods({
    insertAccountForSaleOrder(){
        let saleOrder=Order.find({});
        let i=1;
        saleOrder.forEach(function (doc) {
            console.log(i++);
            //Account Integration
            let setting = AccountIntegrationSetting.findOne();
            if (setting && setting.integrate) {
                let transaction = [];
                let data = doc;
                let total = doc.total + doc.total;
                data.type = "SaleOrder";
                let ARChartAccount = AccountMapping.findOne({name: 'A/R SO'});
                let saleIncomeChartAccount = AccountMapping.findOne({name: 'Sale Income SO'});
                let transportRevChartAccount = AccountMapping.findOne({name: 'Transport Revenue'});
                let oweInventoryChartAccount = AccountMapping.findOne({name: 'Owe Inventory Customer SO'});
                let COGSChartAccount = AccountMapping.findOne({name: 'COGS SO'});
                let transportExpChartAccount = AccountMapping.findOne({name: 'Transport Expense'});
                let APChartAccount = AccountMapping.findOne({name: 'Transport Payable'});
                let saleDiscountChartAccount = AccountMapping.findOne({name: 'SO Discount'});

                let customerDoc = Customers.findOne({_id: doc.customerId});
                if (customerDoc) {
                    data.name = customerDoc.name;
                    data.des = data.des == "" || data.des == null ? ('កម្ម៉ង់ទិញទំនិញពីអតិថិជនៈ ' + data.name) : data.des;
                }


                transaction.push(
                    {
                        account: ARChartAccount.account,
                        dr: data.total - data.totalDiscount,
                        cr: 0,
                        drcr: data.total - data.totalDiscount
                    },
                    {
                        account: saleIncomeChartAccount.account,
                        dr: 0,
                        cr: data.total - data.totalTransportFee,
                        drcr: -(data.total - data.totalTransportFee)
                    },
                );
                if (data.totalTransportFee > 0) {
                    transaction.push({
                            account: transportRevChartAccount.account,
                            dr: 0,
                            cr: data.totalTransportFee,
                            drcr: -data.totalTransportFee,
                        },
                    );
                }

                transaction.push({
                        account: oweInventoryChartAccount.account,
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
                );
                if (data.totalTransportFee > 0) {
                    transaction.push({
                            account: transportExpChartAccount.account,
                            dr: data.totalTransportFee,
                            cr: 0,
                            drcr: data.totalTransportFee,
                        },
                        {
                            account: APChartAccount.account,
                            dr: 0,
                            cr: data.totalTransportFee,
                            drcr: -data.totalTransportFee,
                        },
                    );
                }
                if (data.totalDiscount > 0) {
                    transaction.push({
                            account: saleDiscountChartAccount.account,
                            dr: data.totalDiscount,
                            cr: 0,
                            drcr: data.totalDiscount,
                        }
                    );
                }
                data.transaction = transaction;
                data.total = total;
                data.journalDate = data.orderDate;
                Meteor.call('insertAccountJournal', data);
            }

        })
    }
})