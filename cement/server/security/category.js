import {Categories} from '../../imports/api/collections/category.js';

// Lib
import './_init.js';

Categories.permit(['insert'])
    .Cement_ifDataInsert()
    .allowInClientCode();
Categories.permit(['update'])
    .Cement_ifDataUpdate()
    .allowInClientCode();
Categories.permit(['remove'])
    .Cement_ifDataRemove()
    .allowInClientCode();
