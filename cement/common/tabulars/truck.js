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
import {Truck} from '../../imports/api/collections/truck.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/truck.html');

tabularOpts.name = 'cement.truck';
tabularOpts.collection = Truck;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Cement_truckAction},
    {data: "_id", title: "ID"},
    {data: "name", title: "Name"},
    {data: "number", title: "Number"},
];
export const TruckTabular = new Tabular.Table(tabularOpts);
