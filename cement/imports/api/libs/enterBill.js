import {Invoices} from '../collections/invoice';
import {AverageInventories} from '../collections/inventory.js';
import {AccountIntegrationSetting} from '../collections/accountIntegrationSetting.js';
import {AccountMapping} from '../collections/accountMapping.js';
import {Customers} from '../collections/customer.js';

export default  class EnterBillMutation {
    static updateInvoiceRefBillId({doc}) {
        console.log('-----------------Update Invoice Ref BillId---------------------');
        if (doc.invoiceId && doc.invoiceId.length > 0) {
            for (let i = 0; i < doc.invoiceId.length; i++) {
                let invoice = Invoices.findOne(doc.invoiceId[i]);
                let invoiceItems = [];
                let totalProfit = 0;
                let totalCost = 0;
                invoice.items.forEach(function (item) {
                    let matchItem = doc.items.find(x => x.itemId == item.itemId && x.originalPrice == item.price);
                    let cost = matchItem.price;
                    if (matchItem.isBill == false) {
                        let inventory = AverageInventories.findOne({
                            branchId: doc.branchId,
                            itemId: item.itemId,
                            stockLocationId: doc.stockLocationId
                        }, {sort: {_id: -1}});
                        cost = inventory.averagePrice;
                    }
                    item.cost = cost;
                    item.amountCost = cost * item.qty;
                    item.profit = item.amount - item.amountCost;
                    totalCost += item.amountCost;
                    totalProfit += item.profit;
                    invoiceItems.push(item);
                });
                console.log('Total Cost' + totalCost);
                Invoices.direct.update({_id: invoice._id}, {
                    $set: {
                        refBillId: doc._id,
                        items: invoiceItems,
                        profit: totalProfit,
                        totalCost: totalCost,
                        refBillDate: doc.enterBillDate
                    }
                });
                //--------------------------
                let setting = AccountIntegrationSetting.findOne();
                if (setting && setting.integrate) {
                    let transaction = [];
                    let ARChartAccount = AccountMapping.findOne({name: 'A/R'});
                    let saleIncomeChartAccount = AccountMapping.findOne({name: 'Sale Income'});
                    let inventoryChartAccount = AccountMapping.findOne({name: 'Inventory'});
                    let COGSChartAccount = AccountMapping.findOne({name: 'COGS'});
                    let transportRevChartAccount = AccountMapping.findOne({name: 'Transport Revenue'});
                    let transportExpChartAccount = AccountMapping.findOne({name: 'Transport Expense'});
                    let APChartAccount = AccountMapping.findOne({name: 'Transport Payable'});
                    let saleDiscountChartAccount = AccountMapping.findOne({name: 'Sale Discount'});


                    transaction.push(
                        {
                            account: ARChartAccount.account,
                            dr: invoice.total - invoice.totalDiscount,
                            cr: 0,
                            drcr: invoice.total - invoice.totalDiscount
                        },
                        {
                            account: saleIncomeChartAccount.account,
                            dr: 0,
                            cr: invoice.total - invoice.totalTransportFee,
                            drcr: -(invoice.total - invoice.totalTransportFee)
                        },
                    );
                    if (invoice.totalTransportFee > 0) {
                        transaction.push(
                            {
                                account: transportRevChartAccount.account,
                                dr: 0,
                                cr: invoice.totalTransportFee,
                                drcr: -invoice.totalTransportFee,
                            },
                        );
                    }
                    transaction.push(
                        {
                            account: inventoryChartAccount.account,
                            dr: 0,
                            cr: totalCost,
                            drcr: -totalCost
                        },
                        {
                            account: COGSChartAccount.account,
                            dr: totalCost,
                            cr: 0,
                            drcr: totalCost
                        },
                    );
                    if (invoice.totalTransportFee > 0) {
                        transaction.push({
                                account: transportExpChartAccount.account,
                                dr: invoice.totalTransportFee,
                                cr: 0,
                                drcr: invoice.totalTransportFee,
                            },
                            {
                                account: APChartAccount.account,
                                dr: 0,
                                cr: invoice.totalTransportFee,
                                drcr: -invoice.totalTransportFee,
                            },
                        );
                    }
                    if (invoice.totalDiscount > 0) {
                        transaction.push({
                                account: saleDiscountChartAccount.account,
                                dr: invoice.totalDiscount,
                                cr: 0,
                                drcr: invoice.totalDiscount,
                            }
                        );
                    }

                    invoice.total = invoice.total + totalCost + invoice.totalTransportFee;

                    let data = invoice;
                    let des = "វិក្កយបត្រ អតិថិជនៈ ";
                    data.type = "Invoice";
                    data.transaction = transaction;
                    data.journalDate = data.invoiceDate;
                    let customerDoc = Customers.findOne({_id: data.customerId});
                    if (customerDoc) {
                        data.name = customerDoc.name;
                        data.des = data.des == "" || data.des == null ? (des + data.name) : data.des;
                    }
                    Meteor.call('updateAccountJournal', data);
                }
                //--------------------------
            }
        }
    }

    static updateInvoiceBack({doc}) {
        if (doc.invoiceId && doc.invoiceId.length > 0) {
            for (let i = 0; i < doc.invoiceId.length; i++) {
                Invoices.update({_id: doc.invoiceId[i]}, {
                    $unset: {
                        refBillId: "",
                        //  profit: "",
                        // totalCost: ""
                    }
                });
            }
        }
    }
};






