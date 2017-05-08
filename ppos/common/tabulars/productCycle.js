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
import {ProductCycle} from '../../imports/api/collections/productCycle.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/productCycle.html');

tabularOpts.name = 'ppos.productCycle';
tabularOpts.collection = ProductCycle;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.PPOS_productCycleAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "cycleType", title: "cycleType"},
];
export const ProductCycleTabular = new Tabular.Table(tabularOpts);
