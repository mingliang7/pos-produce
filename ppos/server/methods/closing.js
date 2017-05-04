import {Closing} from '../../imports/api/collections/closing';

Meteor.methods({
    checkRemoveClosingDate(currentClosingDate){
        let closing= Closing.findOne({}, {sort: {closingDate: -1}});
       return closing || null;
    }
});