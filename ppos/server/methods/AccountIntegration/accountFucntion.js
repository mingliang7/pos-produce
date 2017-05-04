Meteor.methods({
    insertAccountJournal(doc){
        let id;
        let data = {};
        data.journalDate = doc.journalDate;
        data.branchId = doc.branchId;
        data.voucherId = doc.voucherId;
        data.currencyId = doc.currencyId == null ? 'USD' : doc.currencyId;
        data.memo = doc.des == null || doc.des == '' ? 'No Memo' : doc.des;
        data.refId = doc._id;
        data.refFrom = doc.type;
        data.total = doc.total;
        data.transaction = doc.transaction;
        data.cusAndVenname = doc.name;

        Meteor.call('api_journalInsert', data, function (err, res) {
            if (res) {
                id = res;
            } else {
                throw new Meteor.Error(err.message);
            }
        });
        return id;
    },
    updateAccountJournal(doc){
        let isTrue = false;
        let data = {};
        data.journalDate = doc.journalDate;
        data.branchId = doc.branchId;
        data.voucherId = doc.voucherId;
        data.currencyId = doc.currencyId == null ? 'USD' : doc.currencyId;
        data.memo = doc.des == null ? 'No Memo' : doc.des;
        data.refId = doc._id;
        data.refFrom = doc.type;
        data.total = doc.total;
        data.transaction = doc.transaction;
        data.cusAndVenname = doc.name;
        Meteor.call('api_journalUpdate', data, function (err, res) {
            if (!err) {
                isTrue = res;
            } else {
                throw new Meteor.Error(err.message);
            }
        });
        return isTrue;
    },
    removeAccountJournal(doc){
        let isTrue = false;
        let refId = doc._id;
        let refFrom = doc.type;
        Meteor.call('api_journalRemove', refId, refFrom, function (err, res) {
            if (!err) {
                isTrue = res;
            } else {
                throw new Meteor.Error(err);
            }
        });
        return isTrue;
    }
});
