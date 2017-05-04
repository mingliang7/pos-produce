import {LendingStocks} from '../../imports/api/collections/lendingStock.js';

// Lib
import './_init.js';

LendingStocks.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
LendingStocks.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
LendingStocks.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
