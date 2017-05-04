import {UnitConvert} from '../../imports/api/collections/unitConvert.js';

// Lib
import './_init.js';

UnitConvert.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
UnitConvert.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
UnitConvert.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
