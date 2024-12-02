const { authenticate } = require('../../middlewares/auth')
const { authorize } = require('../../middlewares/authorize')
const {
  indexController,
  readController,
  createController,
  updateController,
  readPaymentController,
  updateStatus,
  indexDelete,
  indexDeleteController,
  readHistoryController,
    exportExcelController
} = require('./saleReturnController')
const {
  createValidator,
  updateStatusValidator
} = require('./saleReturnValidator')

const express = require('express')
const router = express.Router()

router.post(
  '/',
  authenticate,
  (req, res, next) => {
    req.apiRole = 'order_create'
    next()
  },
  authorize,
  createValidator,
  createController
)
router.get(
  '/:id/payment-saleReturn',
  authenticate,
  (req, res, next) => {
    req.apiRole = 'order_read'
    next()
  },
  authorize,
  readPaymentController
)
router.get(
  '/',
  authenticate,
  (req, res, next) => {
    req.apiRole = ['order_read', 'order_view_all']
    next()
  },
  authorize,
  indexController
)

router.get(
  '/:id',
  authenticate,
  (req, res, next) => {
    req.apiRole = 'order_read'
    next()
  },
  authorize,
  readController
)

router.patch(
  '/:id/status',
  authenticate,
  (req, res, next) => {
    req.apiRole = 'order_update'
    next()
  },
  authorize,
  updateStatus
)

router.delete(
  '/:id',
  authenticate,
  (req, res, next) => {
    req.apiRole = 'order_delete'
    next()
  },
  authorize,
  indexDeleteController
)

router.get(
  '/:id/history-payment',
  authenticate,
  (req, res, next) => {
    req.apiRole = 'order_read'
    next()
  },
  authorize,
  readHistoryController
);

router.get("/export/excel",authenticate,(req,res,next)=>{
    req.apiRole = '';
    next();
},authorize,exportExcelController)

module.exports = router
