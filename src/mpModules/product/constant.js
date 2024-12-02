import models from "../../../database/models";
const Sequelize = require("sequelize");

export const productIncludes = [
    {
        model: models.Image,
        as: "image",
        attributes: ["id", "originalName", "fileName", "filePath", "path"],
    },
    {
        model: models.Store,
        as: "store",
        attributes: [
            "id",
            "name",
            "phone",
            "provinceId",
            "districtId",
            "wardId",
            "address",
            "createdAt",
        ],
    },
    {
        model: models.Manufacture,
        as: "productManufacture",
        attributes: ["id", "name"],
    },
    {
        model: models.Dosage,
        as: "productDosage",
        attributes: ["id", "name"],
    },
    {
        model: models.Position,
        as: "productPosition",
        attributes: ["id", "name"],
    },
    {
        model: models.CountryProduce,
        as: "country",
        attributes: ["id", "name"],
    },
    {
        model: models.GroupProduct,
        as: "groupProduct",
        attributes: ["id", "name"],
    },
    {
        model: models.ProductCategory,
        as: "productCategory",
        attributes: ["id", "name"],
    },
    {
        model: models.ProductUnit,
        as: "productUnit",
        attributes: [
            "id",
            "unitName",
            "exchangeValue",
            "price",
            "productId",
            "code",
            "barCode",
            "isDirectSale",
            "isBaseUnit",
            "point",
        ],
    }
    // {
    //   model: models.Image,
    //   as: "images",
    //   through: {
    //     attributes: ["isThumbnail"],
    //     where: {
    //       modelName: "product",
    //     },
    //   },
    //   attributes: ["id", "originalName", "fileName", "filePath", "path"],
    // },
];

export const productAttributes = [
    "id",
    "name",
    "shortName",
    "code",
    "barCode",
    "groupProductId",
    "productCategoryId",
    "imageId",
    "dosageId",
    "manufactureId",
    "positionId",
    "countryId",
    "primePrice",
    "price",
    "weight",
    "warningExpiryDate",
    "warningExpiryText",
    "isDirectSale",
    "registerNumber",
    "activeElement",
    "content",
    "packingSpecification",
    "minInventory",
    "maxInventory",
    "description",
    "note",
    "baseUnit",
    "inventory",
    "quantitySold",
    "storeId",
    "branchId",
    "type",
    "isLoyaltyPoint",
    "isBatchExpireControl",
    "expiryPeriod",
    "status",
    "createdAt",
    "drugCode",
    "imageUrl"
];

export const filterInventories = {
    VUOTDINHMUC: 1,
    DUOIDINHMUC: 2,
    CONHANG: 3,
    HETHANG: 4
}