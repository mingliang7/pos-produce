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
import {RingPullTransfers} from '../../imports/api/collections/ringPullTransfer.js';
import {CustomerNullCollection} from '../../imports/api/collections/tmpCollection';
// Page
Meteor.isClient && require('../../imports/ui/pages/ringPullTransfer.html');

tabularOpts.name = 'ppos.ringPullTransfer';
tabularOpts.collection = RingPullTransfers;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.PPOS_ringPullTransferAction},
    {data: "_id", title: "ID"},
    {
        data: "ringPullTransferDate",
        title: "Date",
        render: function (val, type, doc) {
            return moment(val).format('DD/MM/YY');
        }
    },
    {data: "total", title: "Total"},
    {
        data: "_fromBranch",
        title: "From Branch",
        render: function(val) {
            return `${val.khName}(${_.capitalize(val.enName)})`;
        }
    },
    {
        data: "_toBranch",
        title: "To Branch",
        render: function(val) {
            return `${val.khName}(${_.capitalize(val.enName)})`;
        }
    }, {
        data: "_fromUser.username",
        title: "From User",
        render: function(val) {
            return `${_.capitalize(val)}`;
        }
    },{
        data: "_toUser.username",
        title: "To User",
        render: function(val) {
            return `${_.capitalize(val)}`;
        }
    },
    {data: "des", title: "Description"},
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
    //    data: "_customer",
    //    title: "Customer Info",
    //    render: function (val, type, doc) {
    //        return JSON.stringify(val, null, ' ');
    //    }
    //}
];
tabularOpts.extraFields = ['items', 'fromBranchId','toBranchId','stockLocationId'];
export const RingPullTransferTabular = new Tabular.Table(tabularOpts);
