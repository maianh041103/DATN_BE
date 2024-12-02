import express from 'express';
import {
    authenticate,
} from '../../middlewares/auth';
import {
    authorize,
} from '../../middlewares/authorize';
import {
    getProductCategoryList,
    createProductCategory,
    deleteProductCategory,
    updateProductCategory,
} from './productCategoryController';
import {
    productCategoryValidator,
} from './productCategoryValidator.js';

const router = new express.Router();

router.get('/list', getProductCategoryList);
router.post('/create', authenticate, productCategoryValidator, createProductCategory);
router.put('/update/:id', authenticate, productCategoryValidator, updateProductCategory);
router.delete('/delete/:id', authenticate, deleteProductCategory);

module.exports = router;


