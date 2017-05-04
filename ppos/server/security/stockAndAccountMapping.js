import {StockAndAccountMapping} from '../../imports/api/collections/stockAndAccountMapping.js';

// Lib
import './_init.js';

StockAndAccountMapping.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
StockAndAccountMapping.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
StockAndAccountMapping.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
