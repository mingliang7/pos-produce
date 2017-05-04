import {StockParents} from '../../imports/api/collections/stockParents.js';

// Lib
import './_init.js';

StockParents.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
StockParents.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
StockParents.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
