import {Units} from '../../imports/api/collections/units.js';

// Lib
import './_init.js';

Units.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Units.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Units.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
