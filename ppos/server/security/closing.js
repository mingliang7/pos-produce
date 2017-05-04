import {Closing} from '../../imports/api/collections/closing.js';

// Lib
import './_init.js';

Closing.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Closing.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Closing.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
