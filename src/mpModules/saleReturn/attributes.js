import { customerAttributes } from "../customer/attributes";
import {Sequelize} from "sequelize";

const models = require("../../../database/models");
const { userAttributes } = require("../user/attributes");

const productAttributes = [
    "name",
    "shortName",
    "code",
    "barCode",
    "imageId",
    "isBatchExpireControl",
];


const saleReturnItemAttributes = [
    "id", "quantity", "price", "discount", "totalPrice", "point",
    [
        Sequelize.literal(`(
        SELECT CAST(order_products.price / order_products.quantity AS UNSIGNED)
        FROM sale_return_item 
        INNER JOIN sale_returns ON sale_returns.id = sale_return_item.saleReturnId 
        INNER JOIN orders ON sale_returns.orderId = orders.id
        INNER JOIN order_products ON order_products.productUnitId = sale_return_item.productUnitId 
        AND orders.id = order_products.orderId
        WHERE sale_return_item.id = items.id
        LIMIT 1
      )`),
        "orderPrice"
    ]
]

const saleReturnItemBatchAttributes = ["id", "quantity"]

const batchAttributes = ["id", "quantity", "name", "expiryDate"]

const productUnitAttributes = [
    "id",
    "unitName",
    "exchangeValue",
    "code",
    "barCode",
    "isBaseUnit",
]

export const saleReturnIncludes = [
    {
        model: models.Store,
        as: "store",
        attributes: ["id", "name", "phone"],
    },
    {
        model: models.Branch,
        as: "branch",
        attributes: ["id", "name", "code"],
    },
    {
        model: models.User,
        as: "user",
        attributes: userAttributes,
    },
    {
        model: models.User,
        as: "creator",
        attributes: userAttributes,
    },
    {
        model: models.Customer,
        as: "customer",
        attributes: customerAttributes,
    },
    {
        model: models.SaleReturnItem,
        as: "items",
        attributes: saleReturnItemAttributes,
        include: [
            {
                model: models.SaleReturnBatch,
                as: "batches",
                attributes: saleReturnItemBatchAttributes,
                include: [{
                    model: models.Batch,
                    attributes: batchAttributes,
                    as: "batch"
                }]
            },
            {
                model: models.ProductUnit,
                as: "productUnit",
                attributes: productUnitAttributes,
                include: [
                    {
                        model: models.Product,
                        attributes: productAttributes,
                        as: "product",
                    },
                ],
            }
        ],
    },
    {
        model: models.Order,
        as: "order",
        attributes: ["code","userId","customerId","groupCustomerId","totalPrice"],
        include:[
            {
                model: models.User,
                as: "creator",
                attributes: ["username"]
            }
        ]
    }
];

export const saleReturnAttributes = [
    "id",
    "code",
    "userId",
    "description",
    "storeId",
    "branchId",
    "customerId",
    "totalPrice",
    "paid",
    "debt",
    "discount",
    "returnFee",
    "paymentType",
    "status",
    "createdAt"
];

