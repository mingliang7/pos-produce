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
import {LocationTransfers} from '../../imports/api/collections/locationTransfer';

// Page
Meteor.isClient && require('../../imports/ui/pages/locationTransfer.html');

tabularOpts.name = 'ppos.locationTransfer';
tabularOpts.collection = LocationTransfers;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.PPOS_locationTransferAction},
    {data: "_id", title: "ID"},
    {
        data: "locationTransferDate",
        title: "Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YY');
        }
    },
    {data: "total", title: "Total"},
    {data: "des", title: "Description"},
    {
        data: "_fromBranch",
        title: "From Branch",
        render: function(val) {
            return `${val.khName}(${_.capitalize(val.enName)})`;
        }
    },{
        data: "_toBranch",
        title: "To Branch",
        render: function(val) {
            return `${val.khName}(${_.capitalize(val.enName)})`;
        }
    },
    {
        data: "_fromStockLocation.name",
        title: "From Stock",
    },{
        data: "_toStockLocation.name",
        title: "To Stock",
    },
    {
        data: "_fromUser.username",
        title: "From User",
        render: function(val) {
            return _.capitalize(val);
        }
    },
    {
        data: "_toUser.username",
        title: "To User",
        render: function(val) {
            return _.capitalize(val || '');
        }
    },
    {
        data: "status",
        title: "Status",
        render: function(val) {
            if(val == 'active') {
                return `<span class="label label-info">${val}</span>`;
            }else if (val == 'declined') {
                return `<span class="label label-danger">${val}</span>`;
            }
            return `<span class="label label-success">${val}</span>`;
        }
    },
    //{
    //    data: "_vendor",
    //    title: "Vendor Info",
    //    render: function (val, type, doc) {
    //        return JSON.stringify(val, null, ' ');
    //    }
    //}
];
export const LocationTransferTabular = new Tabular.Table(tabularOpts);
