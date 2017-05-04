import {StockParents} from '../../imports/api/collections/stockParents';
Meteor.methods({
    fetchStockParentsAsSelectOptions(){
        let list = [];
        let stockParents = StockParents.aggregate([
            {
                $unwind: {path: '$parents', preserveNullAndEmptyArrays: true}
            },
            {
                $lookup: {
                    from: 'ppos_stockParents',
                    localField: 'parents',
                    foreignField: "_id",
                    as: 'parentsDoc'
                }
            },
            {
                $unwind: {path: '$parentsDoc', preserveNullAndEmptyArrays: true}
            },
            {
                $group: {
                    _id: '$_id',
                    name: {$last: '$name'},
                    parents: {
                        $push: {
                            name: '$parentsDoc.name',
                            _id: '$parentsDoc._id'
                        }
                    }
                }
            },
            {$sort: {_id: 1}}
        ]);
        stockParents.forEach(function (doc) {
            let countParents = 0;
            let parents = [];
            let parentsObj = [];
            doc.parents.forEach(function (parent) {
                if (!_.isEmpty(parent)) {
                    countParents += 1;
                    parents.push(parent._id);
                    parentsObj.push(parent);
                }
            });
            let repeatSpace = _.repeat('&nbsp;&nbsp;&nbsp;&nbsp;', countParents);
            let label = Spacebars.SafeString(parents.length > 0 ? `${repeatSpace}${doc.name}` : doc.name);
            list.push({
                'data-parents': parents.join(','),
                label: label.string,
                value: doc._id
            })
        });
        return list;
    }
});
