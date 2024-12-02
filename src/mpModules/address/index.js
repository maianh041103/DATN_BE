
import express from 'express';
import {
    indexProvincesController,
    indexDistrictsController,
    indexWardsController,
} from './addressController';

const router = new express.Router();

router.get('/', indexProvincesController);
router.get('/:provinceId', indexDistrictsController);
router.get('/:provinceId/:districtId', indexWardsController);

module.exports = router;

