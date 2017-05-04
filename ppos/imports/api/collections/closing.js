import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';

// Lib
import {__} from '../../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../ui/libs/select-opts.js';
export const Closing = new Mongo.Collection("ppos_closing");
Closing.schema = new SimpleSchema({
    description: {
        type: String,
        optional: true,
        max: 200
    },
    closingDate: {
        type: Date,
         autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',
                },
                
            }

        }
    }
});

Meteor.startup(function () {
    Closing.schema.i18n("ppos.closing.schema");
    Closing.attachSchema(Closing.schema);
});