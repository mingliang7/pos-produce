import {Meteor} from 'meteor/meteor';
import {Templet} from 'meteor/templating';
import {Tabular} from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {Order} from '../../imports/api/collections/order.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/order.html');

tabularOpts.name = 'cement.order';
tabularOpts.collection = Order;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Cement_orderAction},
    {data: "_id", title: "ID"},
    {data: "voucherId", title: "Voucher"},
    {
        data: "orderDate",
        title: "Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YY');
        }
    },
    {data: "_customer.name", title: "Customer"},
    {data: "subTotal", title: "Sub Total"},
    {data: "discount", title: "Discount"},
    {data: "total", title: "Total"},
    {data: "sumRemainQty", title: "Remain QTY"},
    {data: "isPurchased", title: "Purchased"},
    {data: "des", title: "Description"},
    {
        data: 'status',
        title: "Status",
        render: function (val) {
            if (val == 'active') {
                return `<label class="label label-primary">A</label>`;
            }
            return `<label class="label label-success">C</label>`;
        }
    },
    {
        data: 'paymentStatus',
        title: "Payment Status",
        render: function (val) {
            if (val == 'active') {
                return `<label class="label label-primary">A</label>`;
            } else if (val == 'partial') {
                return `<label class="label label-warning">P</label>`;
            }
            return `<label class="label label-success">C</label>`;
        }
    }
    //{
    //    data: "_customer",
    //    title: "Customer Info",
    //    render: function (val, type, doc) {
    //        return JSON.stringify(val, null, ' ');
    //    }
    //}
];
tabularOpts.extraFields = ['items', 'customerId','printId'];
export const OrderTabular = new Tabular.Table(tabularOpts);
