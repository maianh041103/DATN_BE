import { authenticate } from '../../middlewares/auth';
import { authorize } from '../../middlewares/authorize';
import {
    indexManufacturesController,
    readController,
    createController,
    updateController,
    deleteController,
} from './manufactureController';
import { createValidator } from './manufactureValidator';

const express = require('express');

const router = new express.Router();

router.get('/',
    authenticate,
    (req, res, next) => {
        req.apiRole = [
            'product_manufacture_read',
            'product_read',
        ]; next();
    },
    authorize,
    indexManufacturesController
);

router.post('/',
    authenticate,
    (req, res, next) => { req.apiRole = 'product_manufacture_create'; next(); },
    authorize,
    createValidator,
    createController
);

router.get('/:id',
    authenticate,
    (req, res, next) => { req.apiRole = 'product_manufacture_update'; next(); },
    authorize,
    readController
);

router.patch('/:id',
    authenticate,
    (req, res, next) => { req.apiRole = 'product_manufacture_update'; next(); }, authorize,
    createValidator,
    updateController
);

router.delete('/:id',
    authenticate,
    (req, res, next) => { req.apiRole = 'product_manufacture_delete'; next(); },
    authorize,
    deleteController
);

module.exports = router;
