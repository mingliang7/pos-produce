import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {Tabular} from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {tmpCollection} from '../../imports/api/collections/tmpCollection';
// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {ReceivePayment} from '../../imports/api/collections/receivePayment.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/paymentTransactionList.html');

tabularOpts.name = 'cement.paymentTransaction';
tabularOpts.collection = ReceivePayment;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Cement_paymentTransactionAction},
    {data: "_id", title: '#ID'},
    {data: "voucherId", title: 'Voucher'},
    {data: "invoiceId", title: "Invoice ID"},
    {
        data: "paymentDate",
        title: "Date",
        render: function (val) {
            return moment(val).format('DD/MM/YYYY HH:mm')
        }
    },
    {
        data: "_customer.name",
        title: "Customer"
    },
    {
        data: "dueAmount",
        title: "Actual Due Amount",
        render: function (val, type, doc) {
            let recalDueAmountWithDiscountCodAndBenefit = val + (doc.cod || 0) + ( doc.benefit || 0) + (doc.discount || 0);
            return numeral(recalDueAmountWithDiscountCodAndBenefit).format('0,0.00');
        }
    },
    {
        data: "discount", 
        title: "Discount",
        render: function(val){
            return numeral(val).format('0,0.00');            
        }
    },
    {
        data: "cod", 
        title: "COD",
        render: function(val){
            return numeral(val).format('0,0.00');            
        }
    },
    {
        data: "benefit", 
        title: "Benefit",
        render: function(val){
            return numeral(val).format('0,0.00');            
        }
    },
    {
        data: "dueAmount",
        title: 'Due Amount',
        render: function (val) {
            return numeral(val).format('0,0.00');
        }
    },
    {
        data: 'penalty',
        title: 'Penalty',
        render: function(val) {
            return `<span class="label label-info">${numeral(val).format('0,0.00')}</span>`;
        }
    },
    {
        data: "paidAmount",
        title: "Paid Amount",
        render: function (val) {
            return numeral(val).format('0,0.00');
        }
    },
    {
        data: 'balanceAmount',
        title: "Balance Amount",
        render: function (val) {
            if (val > 0) {
                return `<span class="text-red">${numeral(val).format('0,0.00')}</span>`
            }
            return numeral(val).format('0,0.00');
        }
    },
    // {
    //     data: 'paymentType',
    //     title: 'Type',
    //     render: function(val) {
    //         if(val == 'term') {
    //             return `<span class="label label-primary">T</span>`;
    //         }
    //         return `<span class="label label-warning">G</span>`;
    //     }
    // },

    {
        data: 'status',
        title: 'Status',
        render: function (val) {
            if (val == 'closed') {
                return `<span class="label label-success">C</span>`
            }
            return `<span class="label label-danger">P</span>`
        }
    }

// {data: "description", title: "Description"}
]
;
tabularOpts.extraFields=['paymentType'];
export const PaymentTransactionListTabular = new Tabular.Table(tabularOpts);
