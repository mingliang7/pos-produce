import {Invoices} from '../collections/invoice';
export default  class EnterBillMutation {
    static updateInvoiceRefBillId({doc}) {
        console.log('-----------------Update Invoice Ref BillId---------------------')
        if (doc.invoiceId && doc.invoiceId.length > 0) {
            for (let i = 0; i < doc.invoiceId.length; i++) {
                let invoice = Invoices.findOne(doc.invoiceId[i]);
                let invoiceItems = [];
                let totalProfit = 0;
                let totalCost = 0;
                invoice.items.forEach(function (item) {
                    let matchItem = doc.items.find(x=> x.itemId == item.itemId && x.originalPrice == item.price);
                    let cost = matchItem.price;
                    item.cost = cost;
                    item.amountCost = cost * item.qty;
                    item.profit = item.amount - item.amountCost;
                    totalCost += item.amountCost;
                    totalProfit += item.profit;
                    invoiceItems.push(item);

                });
                console.log(invoice.items);
                console.log('--------------');
                console.log(invoiceItems);
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
};