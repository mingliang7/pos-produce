import {Reps} from '../../imports/api/collections/rep.js';

// Lib
import './_init.js';

Reps.permit(['insert'])
    .PPOS_ifDataInsert()
    .allowInClientCode();
Reps.permit(['update'])
    .PPOS_ifDataUpdate()
    .allowInClientCode();
Reps.permit(['remove'])
    .PPOS_ifDataRemove()
    .allowInClientCode();
