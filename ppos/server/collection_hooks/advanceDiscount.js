// Collection
import {AdvanceDiscount} from '../../imports/api/collections/advanceDiscount.js';
import {AccountIntegrationSetting} from '../../imports/api/collections/accountIntegrationSetting';

AdvanceDiscount.before.insert(function (userId, doc) {
    let setting = AccountIntegrationSetting.findOne();
    if (setting && setting.integrate) {
        if (doc.isUsed && doc.account == null) {
            throw new Meteor.Error('Used chart account, you have to choice one chart account.');
        }
    }
    doc._id = idGenerator.gen(AdvanceDiscount, 3);
});

AdvanceDiscount.before.update(function (userId, doc, fieldNames, modifier, options) {
    let setting = AccountIntegrationSetting.findOne();
    if (setting && setting.integrate) {
        if (modifier.$set.isUsed && modifier.$set.account == null) {
            throw new Meteor.Error('Used chart account, you have to choice one chart account.');
        }
    }
});