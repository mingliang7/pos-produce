import {StockLocations} from '../../imports/api/collections/stockLocation.js';

// Lib
import './_init.js';

StockLocations.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
StockLocations.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
StockLocations.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
