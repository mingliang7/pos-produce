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
import {UnitConvert} from '../../imports/api/collections/unitConvert.js';

// Page
Meteor.isClient && require('../../imports/ui/pages/unitConvert.html');

tabularOpts.name = 'ppos.unitConvertTabular';
tabularOpts.collection = UnitConvert;
tabularOpts.columns = [
    {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.PPOS_unitConvertAction},
    {data: "_item.name", title: "Item"},
    {
        data: "coefficient", title: "Coefficient", render: function (val) {
        if (val == 'addition') {
            return 'Addition(+)';
        } else if (val == 'subtract') {
            return 'Subtract(-)';
        } else if (val == 'divide') {
            return 'Divide(/)';
        } else {
            return 'Multiply(*)';
        }
    }
    }, {
        data: "convertAmount", title: "Amount to Convert"
    },
    {data: "_unit.name", title: 'Unit'}
];
tabularOpts.extraFields = ["itemId", "_id", "convertUnit"];
export const UnitConvertTabular = new Tabular.Table(tabularOpts);
