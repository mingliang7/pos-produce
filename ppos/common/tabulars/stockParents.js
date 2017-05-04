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
import {StockParents} from '../../imports/api/collections/stockParents.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/stockParents.html');

tabularOpts.name = 'ppos.stockParents';
tabularOpts.collection = StockParents;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.PPOS_stockParentsAction},
    {data: "_id", title: "ID"},
    {
        data: "name", title: "Name",
        render: function (val, type, doc) {
            return `${_.repeat('&nbsp;&nbsp;&nbsp;&nbsp;', doc.parents && doc.parents.length)}${val}`;
        }
    },
    {data: "desc", title: "Description"},
    // {data: "description", title: "Description"}
];
tabularOpts.extraFields=['parents'];
tabularOpts.order = [[1, 'asc']];
export const StockParentsTabular = new Tabular.Table(tabularOpts);
