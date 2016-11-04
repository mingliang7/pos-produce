import {Reps} from '../../imports/api/collections/rep.js';

// Lib
import './_init.js';

Reps.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Reps.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Reps.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
