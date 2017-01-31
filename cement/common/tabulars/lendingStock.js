import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {Tabular} from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {LendingStocks} from '../../imports/api/collections/lendingStock.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/lendingStock.html');

tabularOpts.name = 'cement.lendingStock';
tabularOpts.collection = LendingStocks;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Cement_lendingStockAction},
    {data: "_id", title: "ID"},
    {
        data: "lendingStockDate",
        title: "Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YY');
        }
    },
    {data: "total", title: "Total"},
    {data: "des", title: "Description"},
    {data: "vendorId", title: "Vendor ID"},
    {data: "staffId", title: "Staff ID"},
    {data: "stockLocationId", title: "Stock Location"},
    //{
    //    data: "_vendor",
    //    title: "Vendor Info",
    //    render: function (val, type, doc) {
    //        return JSON.stringify(val, null, ' ');
    //    }
    //}
];
tabularOpts.extraFields = ['items', 'dueDate', 'stockLocationId', 'repId', 'voucherId', 'billType', 'prepaidId', 'paymentGroupId'];
export const LendingStockTabular = new Tabular.Table(tabularOpts);
