import {Meteor} from 'meteor/meteor';
import {Invoices} from '../../imports/api/collections/invoice';
Meteor.methods({
    testCustomerHistory(){
        let query = moment('2017-01-31').toDate()
        let invoices = Invoices.aggregate([
            {$match: {invoiceDate: {$lte: query}}},
            {
                $lookup: {
                    from: "cement_receivePayment",
                    localField: "_id",
                    foreignField: "invoiceId",
                    as: "paymentDoc"
                }
            }
        ]);
        let groupDateObj = {};
        let arr = [];
        let beginningBalance = 0;
        invoices.forEach(function (doc) {
            let groupDate = moment(doc.invoiceDate).format('MM/YYYY');
            if (!groupDateObj[groupDate]) {
                groupDateObj[groupDate] = {
                    date: moment(doc.invoiceDate).toDate(),
                    data: [{type: 'invoice', date: moment(doc.invoiceDate).toDate(), paidAmount:0, balance: 0, total: doc.total}]
                }
            } else {
                groupDateObj[groupDate].data.push({type: 'invoice',date: moment(doc.invoiceDate).toDate, paidAmount:0, balance: 0, total: doc.total})
            }
            doc.paymentDoc.forEach(function (payment) {
                let groupPayDate = moment(payment.paymentDate).format('MM/YYYY');
                if (!groupDateObj[groupPayDate]) {
                    groupDateObj[groupPayDate] = {
                        date: moment(payment.paymentDate).toDate(),
                        data: [{type: 'receive-payment', date: moment(payment.paymentDate).toDate(), paidAmount: payment.paidAmount, balance: payment.balanceAmount}]
                    }
                } else {
                    groupDateObj[groupPayDate].data.push({type: 'receive-payment', date: moment(payment.paymentDate).toDate, paidAmount: payment.paidAmount, balance: payment.balanceAmount})
                }
            });
        });
        for(let k in groupDateObj) {
            let sortData = _.sortBy(groupDateObj[k].data, function(value) {return new Date(value.date);});
            groupDateObj[k].data = sortData;
            arr.push(groupDateObj[k]);
        }
        arr.forEach(function (doc) {
            doc.data.forEach(function (o) {
                if(o.type == 'invoice'){
                    o.beginningBalance = o.total + beginningBalance;
                    beginningBalance += o.total;
                    o.balanceAmount = beginningBalance + o.total;

                }else{
                    o.beginningBalance = beginningBalance - o.paidAmount;
                    o.balanceAmount = beginningBalance - o.paidAmount;
                    beginningBalance -= o.paidAmount;
                }
            });
        });
        return beginningBalance;
    }
});