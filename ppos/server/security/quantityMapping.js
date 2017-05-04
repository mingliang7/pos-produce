import {QuantityRangeMapping} from '../../imports/api/collections/quantityRangeMapping.js';

// Lib
import './_init.js';

QuantityRangeMapping.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
QuantityRangeMapping.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
QuantityRangeMapping.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
