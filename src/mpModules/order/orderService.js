import { createWarehouseCard } from '../warehouse/warehouseService'
import { warehouseStatus } from '../warehouse/constant'
import { addInventory, getInventory } from '../inventory/inventoryService'
import { createOrderPayment } from './OrderPaymentService'
import { raiseBadRequestError } from '../../helpers/exception'

const moment = require('moment')
const {
  addFilterByDate,
  randomString,
  formatDecimalTwoAfterPoint
} = require('../../helpers/utils')
const {
  getCustomer,
  customerFilter,
  readCustomer
} = require('../customer/customerService')
const { orderProductFilter } = require('./orderProductService')
const {
  productFilter,
  hashProductPrice,
  extractFieldProduct
} = require('../product/productService')
const { createOrderLog } = require('./orderHistoryService')
const { createUserTracking } = require('../behavior/behaviorService')
const { createNotificationVersion1 } = require('../notification/notifyService')
const {
  sendNotificationThroughSms
} = require('../notification/smsIntegrationService')
const { indexUsers, readUser } = require('../user/userService')
const { readBranch } = require('../branch/branchService')
const {
  updateProductStatistic
} = require('../productStatistic/productStatisticService')
const Sequelize = require('sequelize')
const _ = require('lodash')
const { Op } = Sequelize
const models = require('../../../database/models')
const {
  orderStatuses,
  orderStatusOptions,
  paymentTypes,
  thresholdPercentDiscount,
  discountTypes
} = require('./orderConstant')
const { iconOrderNotificationId } = require('../notification/notifyConstant')
const {
  PAGE_LIMIT,
  accountTypes,
  logActions
} = require('../../helpers/choices')
const { HttpStatusCode } = require('../../helpers/errorCodes')
const { productTypes } = require('../product/productConstant')
const { readBatch } = require('../batch/batchService')
const { readProductUnit } = require('../product/productUnitService')
const pointContant = require('../point/pointContant')
const transactionContant = require('../transaction/transactionContant')
const transactionService = require('../transaction/transactionService')
const userLogContant = require('../userLog/userLogContant');

const userAttributes = [
  'id',
  'username',
  'email',
  'fullName',
  'avatarId',
  'birthday',
  'gender',
  'phone',
  'roleId',
  'position',
  'lastLoginAt',
  'status'
]

const userIncludes = [
  {
    model: models.Image,
    as: 'avatar',
    attributes: ['id', 'originalName', 'fileName', 'filePath', 'path']
  }
]

const orderIncludes = [
  {
    model: models.Prescription,
    as: 'prescription',
    include: [
      {
        model: models.Doctor,
        as: 'doctor',
        attributes: ['name', 'phone', 'code', 'email', 'gender'],
        paranoid: false
      },
      {
        model: models.HealthFacility,
        as: 'healthFacility',
        attributes: ['id', 'name', 'storeId']
      }
    ]
  },
  {
    model: models.SaleReturn,
    as: 'saleReturn',
    attributes: ['code']
  },
  {
    model: models.Branch,
    as: 'branch',
    attributes: [
      'id',
      'name',
      'phone',
      'code',
      'zipCode',
      'provinceId',
      'districtId',
      'wardId',
      'isDefaultBranch',
      'createdAt'
    ]
  },
  {
    model: models.User,
    as: 'user',
    attributes: userAttributes,
    paranoid: false
  },
  {
    model: models.User,
    as: 'creator',
    attributes: userAttributes,
    paranoid: false
  },
  {
    model: models.Customer,
    as: 'customer',
    attributes: [
      'id',
      'fullName',
      'phone',
      'email',
      'address',
      'groupCustomerId'
    ],
    paranoid: false
  }
]

const orderAttributes = [
  'id',
  'code',
  'description',
  'userId',
  'customerId',
  'storeId',
  'branchId',
  'paymentType',
  'point',
  'totalPrice',
  'cashOfCustomer',
  'discountOrder',
  'customerOwes',
  'refund',
  'discount',
  'discountType',
  'isVatInvoice',
  'status',
  'paymentPoint',
  'discountByPoint',
  'createdAt',
  'createdBy',
  'canReturn',
    'marketOrderId'
]

const productAttributes = ['name', 'shortName', 'code', 'barCode', 'imageId']

const orderProductIncludes = [
  {
    model: models.ProductUnit,
    as: 'productUnit',
    attributes: ['id', 'unitName', 'exchangeValue', 'price', 'isBaseUnit'],
    paranoid: false
  },
  {
    model: models.Product,
    as: 'product',
    attributes: productAttributes,
    include: [
      {
        model: models.Image,
        as: 'image',
        attributes: ['id', 'originalName', 'fileName', 'filePath', 'path']
      }
    ]
  },

  {
    model: models.OrderProductBatch,
    as: 'batches',
    attributes: ['id', 'quantity'],
    include: [
      {
        model: models.Batch,
        as: 'batch',
        attributes: ['id', 'name', 'quantity', 'expiryDate']
      }
    ]
  }
]

export async function indexOrders(params, loginUser) {
  let {
    page = 1,
    limit = 10,
    keyword,
    code = '',
    phone = '',
    userId,
    branchId,
    canReturn,
    storeId,
    status,
    userIds = [],
    statusIds = [],
    customerId,
    customerIds = [],
    productIds = [],
    groupCustomerId,
    groupCustomerIds = [],
    paymentType = '',
    positions = [],
    dateRange = {},
    from,
    to
  } = params
  const query = {
    attributes: orderAttributes,
    offset: +limit * (+page - 1),
    include: orderIncludes,
    limit: +limit,
    order: [['id', 'DESC']],
    distinct: true
  }

  const where = {
    status: orderStatuses.SUCCEED
  }

  if (storeId) {
    where.storeId = storeId
  }
  if (canReturn) {
    where.canReturn = canReturn == 'true' ? 1 : 0
  }

  if (branchId) {
    where.branchId = branchId
  }

  if (status) {
    where.status = status
  }

  if (code) {
    where.code = {
      [Op.like]: `%${code.trim()}%`
    }
  }

  if (keyword) {
    where.code = {
      [Op.like]: `%${keyword.trim()}%`
    }
  }

  // Tìm kiếm theo trạng thái đơn hàng
  if (_.isArray(statusIds) && statusIds.length) {
    where.status = {
      [Op.in]: statusIds
    }
  }

  // Tìm kiếm theo ngày tạo đơn hàng
  try {
    dateRange = JSON.parse(dateRange)
  } catch (e) {
    dateRange = {}
  }
  const { startDate, endDate } = dateRange
  if (
    startDate &&
    moment(startDate).isValid() &&
    endDate &&
    moment(endDate).isValid()
  ) {
    where.createdAt = addFilterByDate([startDate, endDate])
  }

  // Tìm kiếm theo phương thức thanh toán
  if (paymentType) {
    where.paymentType = paymentType
  }

  // Tìm kiếm theo khách hàng
  if (customerId) {
    customerIds.push(customerId)
  }

  if (_.isArray(customerIds) && customerIds.length) {
    where.customerId = { [Op.in]: customerIds }
  }

  // Tìm kiếm theo nhóm khách hàng
  if (groupCustomerId) {
    groupCustomerIds.push(groupCustomerId)
  }
  if (_.isArray(groupCustomerIds) && groupCustomerIds.length) {
    where.groupCustomerId = groupCustomerIds
  }

  // Tìm kiếm sản phẩm có trong đơn hàng
  if (_.isArray(productIds) && productIds.length) {
    const tempOrderProducts = await orderProductFilter({
      productId: productIds
    })
    const orderIds = tempOrderProducts.map(o => o.orderId)
    if (orderIds.length) {
      where.id = {
        [Op.in]: orderIds
      }
    } else {
      return {
        success: true,
        data: {
          items: [],
          totalItem: 0,
          totalPrice: 0
        }
      }
    }
  }

  // Tìm kiếm theo người phụ trách, dựa vào lịch sử duyệt đơn để nâng cấp chức năng này
  if (userId) {
    userIds.push(userId)
  }
  if (_.isArray(userIds) && userIds.length) {
    where.createdBy = {
      [Op.in]: userIds
    }
  }

  if (from && to) {
    where.createdAt = {
      [Op.and]: {
        [Op.gte]: moment(from),
        [Op.lte]: moment(to)
      }
    }
  }

  query.where = where

  const [items, totalItem] = await Promise.all([
    models.Order.findAll(query),
    models.Order.count(query)
  ])

  for (const item of items) {
    const products = await models.OrderProduct.findAll({
      include: orderProductIncludes,
      where: {
        orderId: item.id,
        comboId: {
          [Op.eq]: null
        }
      }
    })
    item.dataValues.products = products
    item.dataValues.totalProducts = products.length
    let totalQuantities = 0
    products.forEach(product => {
      totalQuantities += +product.quantity
    })
    item.dataValues.totalQuantities = totalQuantities
  }

  const totalPrices = await models.Order.findAll({
    attributes: [
      [Sequelize.fn('sum', Sequelize.col('totalPrice')), 'totalPrice']
    ],
    raw: true,
    where
  })

  const [totalPrice = {}] = totalPrices

  return {
    success: true,
    data: {
      items,
      totalItem,
      totalPrice: _.get(totalPrice, 'totalPrice', 0) || 0
    }
  }
}

export async function readOrder(result) {
  const {id,saleReturn} = result;
  const order = await models.Order.findByPk(id, {
    include: orderIncludes,
    attributes: orderAttributes
  });

  let orderProductWhere = {
    orderId: id,
    comboId: {
      [Op.eq]: null
    }
  }

  if(saleReturn){
    orderProductWhere[Op.or] = [
        { quantity: {
                [Op.ne]: Sequelize.col('quantityLast')
              }},
        { quantityLast: null }
      ]
  }

  const products = await models.OrderProduct.findAll({
    attributes: [
      'productId',
      'comboId',
      'quantity',
      'customerId',
      'price',
      'itemPrice',
      'point',
      'quantityLast',
        'marketOrderProductId'
    ],
    include: orderProductIncludes,
    where: orderProductWhere
  });

  let series = [];
  if(order.marketOrderId){
    series = await models.Seri.findAll({
      where:{
        marketOrderId: order.marketOrderId
      }
    });
  }

  let totalPrice = 0
  for (const item of products) {
    let itemPrice = item.itemPrice
    if (itemPrice == null) {
      itemPrice = productUnit.price
    }
    totalPrice += item.itemPrice * item.quantity
    if(item.marketOrderProductId){
      const marketProduct = await models.MarketProduct.findOne({
        where:{
          productId:item.productId
        }
      });
      item.dataValues.series = series.filter(item=>item.marketProductId === marketProduct.id);
    }
  }

  let discountAmount =
    order.discountType == 1
      ? (order.discount * totalPrice) / 100
      : order.discount

  const totalDiscountOrder = order.discountOrder + discountAmount

  order.dataValues.totalDiscountOrder = totalDiscountOrder
  order.dataValues.products = products
  order.dataValues.totalProducts = products.length
  let totalQuantities = 0
  products.forEach(product => {
    totalQuantities += +product.quantity
  })
  order.dataValues.totalQuantities = totalQuantities

  return {
    success: true,
    data: {
      order,
      products
    }
  }
}

function generateOrderCode(no) {
  if (no <= 0) return 'DH000000000'
  if (no < 10) return `DH00000000${no}`
  if (no < 100) return `DH0000000${no}`
  if (no < 1000) return `DH000000${no}`
  if (no < 10000) return `DH00000${no}`
  if (no < 100000) return `DH0000${no}`
  if (no < 1000000) return `DH000${no}`
  if (no < 10000000) return `DH00${no}`
  if (no < 100000000) return `DH0${no}`
  if (no < 1000000000) return `DH${no}`
  return no
}

async function checkApplyDiscount(listDiscountId, storeId){
  const config = await models.DiscountConfig.findOne({
    where:{
      storeId
    }
  });
  if(config.isMergeDiscount === false){
    const discounts = await models.Discount.findAll({
      where:{
        id:{
          [Op.in]:listDiscountId
        }
      }
    });
    let discountTypes = [];
    for(let item of discounts){
      if(!discountTypes.includes(item.target)){
        discountTypes.push(item.target);
      }
    }
    if(discountTypes.length > 1){
      return false;
    }
  }
  return true;
}
// Đơn hàng tạo trên quầy
// discountType = 1 => %
// discountType = 2 => VND
async function handleCreateOrder(order, loginUser) {
  if (!order.products || !order.products.length) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message: `Bạn cần chọn sản phẩm để tiến hành thanh toán`
    }
  }
  const [responseReadCustomer, responseReadUser, responseReadBranch] =
    await Promise.all([
      readCustomer(order.customerId, loginUser),
      readUser(order.userId, loginUser),
      readBranch(order.branchId, loginUser)
    ])
  if (responseReadCustomer.error) {
    return responseReadCustomer
  }
  if (responseReadUser.error) {
    return responseReadUser
  }
  if (responseReadBranch.error) {
    return responseReadBranch
  }

  if(!(await checkApplyDiscount(order.listDiscountId || {}, loginUser.storeId))){
    throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Không thể áp dụng đồng thời khuyến mãi`
        })
    )
  }

  const point =
    (await models.Point.findOne({
      where: {
        storeId: loginUser.storeId,
        status: 'active'
      }
    })) || {}

  if ((!point || point.isPointPayment == false) && order.paymentPoint > 0) {
    throw Error(
      JSON.stringify({
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Cửa hàng không áp dụng đổi điểm tích lũy`
      })
    )
  }

  //Kiểm tra khách hàng có được áp mã không
  let checkCustomer = 0
  if (point && point.isAllCustomer == true) {
    checkCustomer = 1
  } else {
    const customer = await models.Customer.findOne({
      where: {
        id: order.customerId || -1,
        storeId: loginUser.storeId
      }
    })
    if (customer) {
      const groupCustomers = await models.CustomerGroupCustomer.findAll({
        where: {
          customerId: order.customerId
        }
      });
      const groupCustomerIds = groupCustomers.map(x => x.groupCustomerId);
      if (!groupCustomers) {
        checkCustomer = 0
      } else {
        const pointCustomerExist = await models.PointCustomer.findOne({
          where: {
            groupCustomerId: {
              [Op.in]:groupCustomerIds
            }
          }
        })
        if (pointCustomerExist) {
          checkCustomer = 1
        }
      }
    }
  }
  //End kiểm tra khách hàng có được áp mã không
  const findCustomer = responseReadCustomer.data
  if (
    point &&
    order.paymentPoint > 0 &&
    (checkCustomer == 0 ||
      !order.customerId ||
      findCustomer.dataValues.totalOrder < point.afterByTime)
  ) {
    throw Error(
      JSON.stringify({
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Khách hàng không đủ điều kiện thanh toán bằng điểm`
      })
    )
  }

  let moneyDiscountByPoint = 0
  if (point) {
    moneyDiscountByPoint =
      (order.paymentPoint / point.convertPoint) * point.convertMoneyPayment || 0
  }
  if (order.paymentPoint > findCustomer.point) {
    throw Error(
      JSON.stringify({
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message: `Điểm không đủ`
      })
    )
  }

  let newOrder
  let discountAmount = 0
  await models.sequelize.transaction(async t => {
    newOrder = await models.Order.create(
      {
        code: `${loginUser.storeId || ''}S${randomString(12)}`,
        description: order.description,
        userId: order.userId,
        customerId: findCustomer.id,
        prescriptionId: order.prescriptionId,
        groupCustomerId: findCustomer.groupCustomerId,
        totalPrice: 0,
        paymentType: order.paymentType,
        cashOfCustomer: order.cashOfCustomer,
        customerOwes: 0,
        refund: 0,
        discount: 0,
        discountType: order.discountType,
        status: orderStatuses.DRAFT,
        storeId: loginUser.storeId,
        branchId: order.branchId,
        createdBy: loginUser.id,
        discountOrder: order.discountOrder || 0,
        paymentPoint: order.paymentPoint,
        discountByPoint: moneyDiscountByPoint
      },
      { transaction: t }
    )

    const listDiscountId = order.listDiscountId || []
    for (const id of listDiscountId) {
      await models.DiscountApply.create(
        {
          orderId: newOrder.id,
          discountId: id
        },
        {
          transaction: t
        }
      )
    }

    let totalPrice = 0
    let totalItemPrice = 0
    let productItems = []
    for (const item of order.products) {
      const findProduct = await models.Product.findOne({
        where: {
          id: item.productId,
          storeId: loginUser.storeId
        },
        include: [
          {
            model: models.ProductUnit,
            as: 'productUnit',
            attributes: [
              'id',
              'unitName',
              'exchangeValue',
              'price',
              'productId',
              'code',
              'barCode',
              'isDirectSale',
              'isBaseUnit',
              'point',
              'createdBy',
              'createdAt'
            ],
            where: {
              id: item.productUnitId
            }
          }
        ]
      })
      if (!findProduct) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Sản phẩm (${item.productId}) không tồn tại`
          })
        )
      }
      const productUnit = await models.ProductUnit.findOne({
        where: {
          id: item.productUnitId,
          productId: item.productId,
          storeId: loginUser.storeId
        }
      })
      if (!productUnit) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Đơn vị sản phẩm không tồn tại`
          })
        )
      }
      let itemPrice = item.itemPrice
      if (itemPrice == null) {
        itemPrice = productUnit.price
      }
      totalPrice += itemPrice * item.quantity
      totalItemPrice += productUnit.price * item.quantity
      const inventory = await getInventory(order.branchId, item.productId)
      if (inventory < item.quantity * productUnit.exchangeValue) {
        throw Error(
          JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: `Sản phẩm ${findProduct.name} không đủ số lượng`
          })
        )
      }

      await createWarehouseCard(
        {
          code: generateOrderCode(newOrder.id),
          type: warehouseStatus.ORDER,
          partner: findCustomer.fullName,
          productId: item.productId,
          branchId: order.branchId,
          changeQty: -item.quantity * +productUnit.exchangeValue,
          remainQty: +inventory - +item.quantity * +productUnit.exchangeValue,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        t
      )
      await addInventory(
        order.branchId,
        item.productId,
        -item.quantity * productUnit.exchangeValue,
        t
      )
      const orderProduct = await models.OrderProduct.create(
        {
          orderId: newOrder.id,
          productId: item.productId,
          productUnitId: productUnit.id,
          isDiscount: item.isDiscount,
          itemPrice: +itemPrice * +item.quantity,
          discountPrice:
            (+productUnit.price - +item.itemPrice) * +item.quantity,
          productUnitData: JSON.stringify(productUnit),
          price: +productUnit.price * +item.quantity,
          quantityBaseUnit: +productUnit.exchangeValue * +item.quantity,
          quantity: item.quantity,
          discount: 0,
          primePrice: findProduct.primePrice,
          userId: newOrder.userId,
          customerId: newOrder.customerId,
          groupCustomerId: newOrder.groupCustomerId,
          createdBy: newOrder.createdBy,
          updatedBy: newOrder.createdBy,
          createdAt: new Date(),
          comboId: null,
          quantityLast: null,
          point: 0
        },
        { transaction: t }
      )
      productItems.push(orderProduct)
      if (findProduct.isBatchExpireControl) {
        for (const _batch of item.batches) {
          const responseReadBatch = await readBatch(_batch.id, loginUser)
          if (responseReadBatch.error) {
            return responseReadBatch
          }
          await models.OrderProductBatch.create(
            {
              orderProductId: orderProduct.id,
              batchId: _batch.id,
              quantity: _batch.quantity
            },
            { transaction: t }
          )
          const batch = responseReadBatch.data
          if (batch.quantity < _batch.quantity * productUnit.exchangeValue) {
            throw Error(
              JSON.stringify({
                error: true,
                code: HttpStatusCode.BAD_REQUEST,
                message: `Sản phẩm (${findProduct.code}) không đủ số lượng tồn`
              })
            )
          }
          await models.Batch.increment(
            {
              quantity: -_batch.quantity * productUnit.exchangeValue
            },
            {
              where: {
                id: _batch.id
              },
              transaction: t
            }
          )
        }
      }
    }

    const totalNewPriceItem = totalPrice

    if (order.discountType === discountTypes.MONEY) {
      discountAmount = order.discount
      totalPrice = totalPrice - discountAmount
    } else if (order.discountType === discountTypes.PERCENT) {
      discountAmount = Math.floor((order.discount * totalItemPrice) / 100)
      totalPrice = totalPrice - discountAmount
    }

    totalPrice -= Math.abs(order.discountOrder || 0)
    totalPrice -= moneyDiscountByPoint

    if (
      order.paymentType === paymentTypes.CASH &&
      order.cashOfCustomer < totalPrice
    ) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Tiền khách trả đang nhỏ hơn số tiền phải thanh toán với hình thức thanh toán là Tiền mặt`
        })
      )
    }

    if (
      order.paymentType === paymentTypes.BANK &&
      order.cashOfCustomer < totalPrice
    ) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Tiền khách trả đang nhỏ hơn số tiền phải thanh toán với hình thức thanh toán là Chuyển khoản`
        })
      )
    }
    if (
      order.paymentType === paymentTypes.DEBT &&
      order.cashOfCustomer >= totalPrice
    ) {
      throw Error(
        JSON.stringify({
          error: true,
          code: HttpStatusCode.BAD_REQUEST,
          message: `Tiền khách trả đang lớn hoặc bằng số tiền phải thanh toán với hình thức thanh toán là Khách nợ`
        })
      )
    }

    let refund = 0
    if (
      order.cashOfCustomer > totalPrice &&
      [paymentTypes.CASH, paymentTypes.BANK].includes(order.paymentType)
    ) {
      refund = order.cashOfCustomer - totalPrice
    }

    let customerOwes = 0
    if (order.paymentType === paymentTypes.DEBT) {
      customerOwes = totalPrice - (order.cashOfCustomer || 0)
      await models.CustomerDebt.create(
        {
          totalAmount: totalPrice,
          debtAmount: customerOwes,
          customerId: newOrder.customerId,
          orderId: newOrder.id,
          type: 'ORDER'
        },
        { transaction: t }
      )
    }
    const code = generateOrderCode(newOrder.id)

    // Update total price
    await models.Order.update(
      {
        totalPrice,
        refund,
        discountAmount,
        customerOwes,
        discount: order.discount || 0,
        code: code,
        status: orderStatuses.SUCCEED
      },
      {
        where: {
          id: newOrder.id
        },
        transaction: t
      }
    )
    newOrder.totalPrice = totalPrice
    newOrder.code = code
    await models.UserLog.create({
      userId: newOrder.createdBy,
      type: userLogContant.TYPE.ORDER,
      amount: totalPrice,
      branchId: newOrder.branchId,
      code: code
    }, { transaction: t })
    for (const orderProduct of productItems) {
      const weight = orderProduct.price / totalItemPrice
      await models.OrderProduct.update(
        {
          discount: Math.round(
            weight * (discountAmount + (order.discountOrder || 0))
          )
        },
        { where: { id: orderProduct.id }, transaction: t }
      )
    }

    const idString = newOrder.id.toString()
    const typeTransaction =
      await transactionService.generateTypeTransactionOrder(loginUser.storeId)
    //Tạo transaction
    const newTransaction = await models.Transaction.create(
      {
        code: `TTHD${idString.padStart(9, '0')}`,
        paymentDate: new Date(),
        ballotType: transactionContant.BALLOTTYPE.INCOME,
        typeId: typeTransaction,
        value:
          order.totalPrice <= order.cashOfCustomer
            ? order.totalPrice
            : order.cashOfCustomer,
        userId: order.userId,
        createdBy: loginUser.id,
        target: transactionContant.TARGET.CUSTOMER,
        targetId: findCustomer.id,
        isDebt: true,
        branchId: order.branchId,
        isPaymentOrder: true
      },
      {
        transaction: t
      }
    )
    //End tạo transaction
    newOrder.transactionId = newTransaction.id;
    await createOrderPayment(newOrder, t)

    console.log('Total price ' + newOrder.totalPrice)
    //Tích điểm
    let pointResult = 0
    //Khuyến mãi - tích điểm
    if (order.pointOrder) {
      pointResult += order.pointOrder
    }
    for (const item of order.products) {
      if (!item.itemPrice) {
        const productUnit = await models.ProductUnit.findOne({
          where: {
            id: item.productUnitId
          }
        })
        item.itemPrice = productUnit.price
      }
    }
    //End khuyến mãi - tích điểm
    if (point) {
      if (
        !order.paymentPoint ||
        order.paymentPoint === 0 ||
        point.isPointBuy === true
      ) {
        //Check áp dụng cho hóa đơn thanh toán bằng điểm không
        if (
          order.customerId &&
          point.status === pointContant.statusPoint.ACTIVE
        ) {
          if (checkCustomer == 1) {
            //Tính điểm áp mã
            if (point.type === pointContant.typePoint.ORDER) {
              //Tính tổng tiền đơn hàng = tổng giá của các sản phẩm (không áp  dụng km hóa đơn ,...)
              if (
                ((point.isDiscountOrder === false &&
                  !(order.discountOrder > 0)) ||
                  point.isDiscountOrder === true) &&
                point.isDiscountProduct === true
              ) {
                pointResult += Math.floor(
                    (newOrder.totalPrice + moneyDiscountByPoint) / point.convertMoneyBuy
                )
                const weight =
                  Math.floor((newOrder.totalPrice + moneyDiscountByPoint) / point.convertMoneyBuy) /
                  totalNewPriceItem
                for (const item of order.products) {
                  await models.OrderProduct.increment(
                    {
                      point: Sequelize.literal(
                        `COALESCE(point, 0) + ${weight * item.itemPrice * item.quantity
                        }`
                      )
                    },
                    {
                      where: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        productUnitId: item.productUnitId
                      },
                      transaction: t
                    }
                  )
                }
              } else if (
                ((point.isDiscountOrder === false &&
                  !(order.discountOrder > 0)) ||
                  point.isDiscountOrder === true) &&
                point.isDiscountProduct === false
              ) {
                //Tính tổng các sản phẩm có isDiscount = 0 và trừ đi chiết khấu
                let totalPriceNotDiscount = 0
                for (const item of order.products) {
                  if (item.itemPrice === null) {
                    const productUnit = await models.ProductUnit.findOne({
                      where: {
                        id: item.productUnitId
                      }
                    })
                    totalPriceNotDiscount += productUnit.price * item.quantity
                  }
                }
                totalPriceNotDiscount -= discountAmount
                if (totalPriceNotDiscount > 0) {
                  pointResult += Math.floor(
                    totalPriceNotDiscount / point.convertMoneyBuy
                  )
                }
                //Cập nhật điểm cho từng sản phẩm
                const weight = Math.floor(totalPriceNotDiscount / point.convertMoneyBuy) / (totalPriceNotDiscount + discountAmount)
                for (const item of order.products) {
                  if (item.itemPrice === null) {
                    await models.OrderProduct.increment(
                      {
                        point: Sequelize.literal(
                          `COALESCE(point, 0) + ${weight * item.itemPrice * item.quantity
                          }`
                        )
                      },
                      {
                        where: {
                          orderId: newOrder.id,
                          productId: item.productId,
                          productUnitId: item.productUnitId
                        },
                        transaction: t
                      }
                    )
                  }
                }
                //End cập nhật điểm cho từng sản phẩm
              }
            } else {
              if (
                point.isDiscountOrder == true ||
                (point.isDiscountOrder == false && !(order.discountOrder > 0))
              ) {
                if (point.isConvertDefault == false) {
                  //Lấy điểm tích ở từng sản phẩm
                  for (const item of order.products) {
                    if (
                      point.isDiscountProduct === true ||
                      (point.isDiscountProduct === false && item.itemPrice === null)
                    ) {
                      const productUnit = await models.ProductUnit.findOne({
                        where: {
                          id: item.productUnitId
                        }
                      })
                      if (productUnit && productUnit.point) {
                        await models.OrderProduct.increment(
                          {
                            point: Sequelize.literal(
                              `COALESCE(point, 0) + ${productUnit.point * item.quantity}`
                            )
                          },
                          {
                            where: {
                              orderId: newOrder.id,
                              productId: item.productId,
                              productUnitId: item.productUnitId
                            },
                            transaction: t
                          }
                        )
                        pointResult += productUnit.point * item.quantity
                      }
                    }
                  }
                } else {
                  //Lấy mặc định
                  for (const item of order.products) {
                    if (
                      point.isDiscountProduct === true ||
                      (point.isDiscountProduct === false &&
                        (item.itemPrice === null))
                    ) {
                      if (!item.itemPrice) {
                        const productUnit = await models.ProductUnit.findOne({
                          where: {
                            id: item.productUnitId
                          }
                        })
                        item.itemPrice = productUnit.price
                      }
                      await models.OrderProduct.update(
                        {
                          point: Sequelize.literal(
                            `IFNULL(point, 0) + ${(Math.floor(item.itemPrice / point.convertMoneyBuy)) * item.quantity}`
                          )
                        },
                        {
                          where: {
                            orderId: newOrder.id,
                            productId: item.productId,
                            productUnitId: item.productUnitId
                          },
                          transaction: t
                        }
                      )
                      pointResult += Math.floor((item.itemPrice / point.convertMoneyBuy)) * item.quantity
                    }
                  }
                }
              }
            }
          }
        }
      }

      for (const item of order.products) {
        if (item.pointProduct) {
          pointResult += item.pointProduct
          await models.OrderProduct.update(
            {
              point: Sequelize.literal(
                `COALESCE(point, 0) + ${item.pointProduct}`
              )
            },
            {
              where: {
                orderId: newOrder.id,
                productId: item.productId,
                productUnitId: item.productUnitId
              },
              transaction: t
            }
          )
        }
      }

      pointResult -= order.paymentPoint || 0
      console.log('PointResult ' + pointResult)
      //End tích điểm

      //Cập nhật điểm
      if (pointResult != 0 && order.customerId) {
        await models.Customer.update(
          {
            point: Sequelize.literal(`COALESCE(point, 0) + ${pointResult}`)
          },
          {
            where: {
              id: order.customerId
            },
            transaction: t
          }
        )

        await models.Order.update(
          {
            point: pointResult + (order.paymentPoint || 0)
          },
          {
            where: {
              id: newOrder.id
            },
            transaction: t
          }
        )

        await models.PointHistory.create(
          {
            customerId: order.customerId,
            orderId: newOrder.id,
            point: pointResult,
            code: code
          },
          {
            transaction: t
          }
        )
      }
    }
  })

  const { data: refreshOrder } = await readOrder({id:newOrder.id})

  return {
    success: true,
    data: refreshOrder
  }
}

export async function createOrder(order, loginUser) {
  try {
    return await handleCreateOrder(order, loginUser)
  } catch (e) {
    console.error(e)
    let errorRes = {}
    try {
      errorRes = JSON.parse(e.message)
    } catch {
      errorRes = {}
    }
    if (errorRes.error) {
      return errorRes
    }

    const { errors = [] } = e
    const [error = {}] = errors
    return {
      error: true,
      code: HttpStatusCode.SYSTEM_ERROR,
      message: `${e.message}: ${_.get(error, 'message', '')}`
    }
  }
}

export async function updateOrder(id, order) {
  const findOrder = await models.Order.findByPk(id)
  if (findOrder) {
    if (
      [orderStatuses.SUCCEED, orderStatuses.CANCELLED].includes(
        findOrder.status
      )
    ) {
      return {
        error: true,
        code: HttpStatusCode.BAD_REQUEST,
        message:
          'Không được thay đổi đơn hàng ở trạng thái đã hủy hoặc thành công'
      }
    }

    const { products = [], shippingAddress = {} } = order

    if (order.paymentType == paymentTypes.BANK) {
      order.thresholdPercentDiscount = thresholdPercentDiscount
    } else {
      order.thresholdPercentDiscount = 0
    }

    // Cập nhật đơn hàng
    const dataUpdate = {
      status: order.statusId,
      paymentType: order.paymentType,
      thresholdPercentDiscount: order.thresholdPercentDiscount,
      description: order.description,
      note: order.note,
      customerId: findOrder.customerId,
      isVatInvoice: order.isVatInvoice,
      storeName: order.isVatInvoice ? order.storeName : '',
      storeTax: order.isVatInvoice ? order.storeTax : '',
      storeAddress: order.isVatInvoice ? order.storeAddress : '',
      name: shippingAddress.receiver,
      phone: shippingAddress.phone,
      address: shippingAddress.detailAddress,
      paidAmount: order.paidAmount,
      email: shippingAddress.email,
      provinceId: shippingAddress.provinceId,
      districtId: shippingAddress.districtId,
      wardId: shippingAddress.wardId,
      updatedBy: order.updatedBy,
      updatedAt: new Date()
    }

    if (typeof order.totalPrice != 'undefined') {
      dataUpdate.totalPrice = order.totalPrice
    }

    await Promise.all([
      createOrderLog({ orderId: id, newOrder: dataUpdate }),
      models.Order.update(dataUpdate, {
        where: {
          id
        },
        individualHooks: true
      }),
      models.OrderProduct.destroy({
        where: {
          orderId: id
        }
      })
    ])

    let totalPrice = 0
    for (let item of products) {
      await models.OrderProduct.create({
        orderId: findOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        oldPrice: item.oldPrice,
        percentDiscount: +formatDecimalTwoAfterPoint(
          ((+item.oldPrice - +item.price) / +item.oldPrice) * 100
        ),
        customerId: findOrder.customerId,
        groupCustomerId: findOrder.groupCustomerId,
        createdBy: findOrder.createdBy,
        updatedBy: findOrder.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      totalPrice += item.price * item.quantity
    }

    if (typeof order.totalPrice == 'undefined') {
      await models.Order.update(
        {
          totalPrice
        },
        {
          where: {
            id: findOrder.id
          }
        }
      )
    }

    createUserTracking({
      accountId: order.updatedBy,
      type: accountTypes.USER,
      objectId: findOrder.id,
      action: logActions.order_update.value,
      data: { id, products, dataUpdate }
    })

    // Thông báo đến khách hàng

    // Tăng sản phẩm đã bán nếu đơn hàng được xác nhận "đơn hàng thành công"
    if (dataUpdate.status === orderStatuses.SUCCEED) {
      for (let item of products) {
        await updateProductStatistic({
          productId: item.productId,
          sold: item.quantity
        })
      }
    }

    return {
      success: true
    }
  }

  return {
    error: true,
    code: HttpStatusCode.NOT_FOUND,
    message: 'Đơn hàng không tồn tại'
  }
}

export async function updateOrderStatus(id, order) {
  const findOrder = await models.Order.findByPk(id)

  if (!findOrder) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: 'Đơn hàng không tồn tại'
    }
  }

  if (
    [orderStatuses.SUCCEED, orderStatuses.CANCELLED].includes(findOrder.status)
  ) {
    return {
      error: true,
      code: HttpStatusCode.BAD_REQUEST,
      message:
        'Không được thay đổi đơn hàng ở trạng thái đã hủy hoặc thành công'
    }
  }

  await Promise.all([
    createOrderLog({ orderId: id, newOrder: order }),
    models.Order.update(order, {
      where: {
        id
      },
      individualHooks: true
    }),
    createUserTracking({
      accountId: order.updatedBy,
      type: accountTypes.USER,
      objectId: id,
      action: logActions.order_update.value,
      data: { id, ...order }
    })
  ])

  return {
    success: true
  }
}

export async function indexProductCustomers(id) {
  const findOrder = await models.Order.findByPk(id, {
    attributes: ['id', 'customerId'],
    raw: true
  })

  if (!findOrder) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: 'Đơn hàng không tồn tại'
    }
  }

  const customer = await getCustomer(findOrder.customerId)

  const hashPrice = _.isEmpty(customer)
    ? {}
    : await hashProductPrice({ loginCustomer: customer })

  return {
    success: true,
    data: {
      items: await extractFieldProduct(
        await productFilter({
          limit: PAGE_LIMIT
        }),
        hashPrice,
        customer
      )
    }
  }
}

export async function getOrder(orderId) {
  const order = await models.Order.findOne({
    attributes: ["id", "totalPrice", "customerId", "cashOfCustomer", "branchId", "userId", "paymentType"],
    where: { id: orderId }
  })
  if (!order) {
    raiseBadRequestError('Đơn hàng không tồn tại')
  }
  return order
}

export async function deleteOrder(id, loginUser) {
  const order = await models.Order.findByPk(id, {
    attributes: ['id']
  })
  if (!order) {
    return {
      error: true,
      code: HttpStatusCode.NOT_FOUND,
      message: 'Không tìm thấy đơn hàng'
    }
  }
  await models.Order.destroy({
    where: {
      id
    }
  })
  createUserTracking({
    accountId: loginUser.id,
    type: accountTypes.USER,
    objectId: id,
    action: logActions.order_delete.value,
    data: {
      id
    }
  })
  return {
    success: true
  }
}

const discountApplyInclude = [
  {
    model: models.Discount,
    as: "discount",
    include: [{
      model: models.DiscountItem,
      as: "discountItem",
      attributes: ["id", "orderFrom", "fromQuantity", "maxQuantity", "discountValue", "discountType", "pointType", "isGift", "pointValue",
        "fixedPrice", "changeType"
      ],
      include: [
        {
          model: models.ProductDiscountItem,
          as: "productDiscount",
          attributes: ["productUnitId", "groupId", "isCondition"],
        }
      ]
    }]
  }
]

export async function getOrderDiscountService(params) {
  const { id } = params;
  const listDiscountOrder = await models.DiscountApply.findAll({
    include: discountApplyInclude,
    where: {
      orderId: id
    }
  });
  return {
    success: true,
    data: listDiscountOrder
  }
}
