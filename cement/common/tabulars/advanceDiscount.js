import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
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
import {AdvanceDiscount} from '../../imports/api/collections/advanceDiscount.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/advanceDiscount.html');

tabularOpts.name = 'cement.advanceDiscount';
tabularOpts.collection = AdvanceDiscount;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Cement_advanceDiscountAction},
    {data: "_id", title: "ID"},
    {
        data: "name",
        title: "Name",
        render: function(val) {
            if(val == 'receivePayment') {
                return 'Receive Payment';
            }else if (val == 'saleOrderReceivePayment') {
                return 'SO Receive Payment';
            }else if (val == 'purchaseOrderReceivePayment') {
                return 'PO receive Payment';
            }
            return '';
        }
    },
    {
        data: "advanceDiscount",
        title: "Advance Discount",
        render: function(val) {
            val && val.map(function (o) {
                return _.capitalize(o);
            });
            return val && val.join(', ');
        }
    },
    {data: "account", title: "Account"},
    {
        data: "isUsed",
        title: "Used",
        render: function (val) {
            if (val) {
                return `<span class="label label-success"><i class="fa fa-check"></i></span>`
            }
            return `<span class="label label-danger"><i class="fa fa-remove"></i></span>`
        }
    },
];
export const AdvanceDiscountTabular = new Tabular.Table(tabularOpts);
