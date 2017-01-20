import {Invoices} from '../collections/invoice';
import {AverageInventories} from '../collections/inventory.js';

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
                    let matchItem = doc.items.find(x=> x.itemId == item.itemId && x.originalPrice == item.price);
                    let cost = matchItem.price;
                    if(matchItem.isBill){
                        let inventory = AverageInventories.findOne({
                            branchId: doc.branchId,
                            itemId: item.itemId,
                            stockLocationId: doc.stockLocationId
                        }, {sort: {_id: -1}});
                        cost=inventory.averagePrice;
                    }
                    item.cost = cost;
                    item.amountCost = cost * item.qty;
                    item.profit = item.amount - item.amountCost;
                    totalCost += item.amountCost;
                    totalProfit += item.profit;
                    invoiceItems.push(item);

                });
                Invoices.update({_id: invoice._id}, {
                    $set: {
                        refBillId: doc._id,
                        items: invoiceItems,
                        profit: totalProfit,
                        totalCost: totalCost
                    }
                });
            }
        }
    }
    static updateInvoiceBack({doc}){
        if (doc.invoiceId && doc.invoiceId.length > 0) {
            for (let i = 0; i < doc.invoiceId.length; i++) {
                Invoices.update({_id: doc.invoiceId[i]}, {
                    $unset: {
                        refBillId:"",
                      //  profit: "",
                        // totalCost: ""
                    }
                });
            }
        }
    }
};






