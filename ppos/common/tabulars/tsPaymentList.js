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
import {TSPayment} from '../../imports/api/collections/tsPayment.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/tsPaymentList.html');

tabularOpts.name = 'ppos.tsPaymentList';
tabularOpts.collection = TSPayment;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.PPOS_tsPaymentListAction},
    {data: "_id", title: '#ID'},
    {data: "voucherId", title: 'Voucher'},
    {data: "invoiceId", title: "Invoice ID"},
    {
        data: "paymentDate",
        title: "Date",
        render: function (val) {
            return moment(val).format('YYYY-MM-DD HH:mm')
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
        data: "dueAmount",
        title: 'Due Amount',
        render: function (val) {
            return numeral(val).format('0,0.00');
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
export const TsPaymentListTabular = new Tabular.Table(tabularOpts);
