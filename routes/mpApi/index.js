import addressApiRouter from "../../src/mpModules/address";
import authApiRouter from "../../src/mpModules/auth";
import roleApiRouter from "../../src/mpModules/role";
import contactWorkApiRouter from "../../src/mpModules/contactWork";
import userApiRouter from "../../src/mpModules/user";
import productCategoryApiRouter from "../../src/mpModules/productCategory";
import groupCustomerApiRouter from "../../src/mpModules/groupCustomer";
import notificationApiRouter from "../../src/mpModules/notification";
import productApiRouter from "../../src/mpModules/product";
import bannerApiRouter from "../../src/mpModules/banner";
import orderApiRouter from "../../src/mpModules/order";
import imageApiRouter from "../../src/mpModules/image";
import imageApiExternalRouter from "../../src/mpModules/image/external.js";
import customerApiRouter from "../../src/mpModules/customer";
import discountProgramApiRouter from "../../src/mpModules/discountProgram";
import configurationApiRouter from "../../src/mpModules/configuration";
import promotionProgramApiRouter from "../../src/mpModules/promotionProgram";
import manufactureApiRouter from "../../src/mpModules/manufacture";
import behaviorLogApiRouter from "../../src/mpModules/behavior";
import reportApiRouter from "../../src/mpModules/report";
import healthCheckApiRouter from "../../src/mpModules/healthCheck";
import storeApiRouter from "../../src/mpModules/store";
import branchApiRouter from "../../src/mpModules/branch";
import groupProductApiRouter from "../../src/mpModules/groupProduct";
import groupSupplierApiRouter from "../../src/mpModules/groupSupplier";
import supplierApiRouter from "../../src/mpModules/supplier";
import specialistApiRouter from "../../src/mpModules/specialist";
import levelApiRouter from "../../src/mpModules/level";
import workPlaceApiRouter from "../../src/mpModules/workPlace";
import doctorApiRouter from "../../src/mpModules/doctor";
import medicationCategoryApiRouter from "../../src/mpModules/medicationCategory";
import positionApiRouter from "../../src/mpModules/position";
import dosageApiRouter from "../../src/mpModules/dosage";
import countryProduceApiRouter from "../../src/mpModules/countryProduce";
import healthFacilityApiRouter from "../../src/mpModules/healthFacility";
import prescriptionApiRouter from "../../src/mpModules/prescription";
import batchApiRouter from "../../src/mpModules/batch";
import inboundApiRouter from "../../src/mpModules/inbound";
import samplePrescriptionApiRouter from "../../src/mpModules/samplePrescription";
import purchaseReturnApiRouter from "../../src/mpModules/purchaseReturn";
import nationalPharmacySystemApiRouter from "../../src/mpModules/nationalPharmacySystem";
import warehouseApiRouter from "../../src/mpModules/warehouse"
const openApiDocumentation = require('../../swagger.json')
const swaggerUi = require('swagger-ui-express');
import moveApiRouter from "../../src/mpModules/move"
import saleReturnApiRouter from "../../src/mpModules/saleReturn"
import discountRouter from "../../src/mpModules/discount/index.js";
import pointRouter from "../../src/mpModules/point/index.js";
import inventoryCheckingRouter from "../../src/mpModules/inventoryChecking/index.js";
import transactionRouter from "../../src/mpModules/transaction/index.js"
import typeTransactionRouter from "../../src/mpModules/typeTransaction/index.js";
import userTransactionRouter from "../../src/mpModules/userTransaction/index.js";
import customerNoteRouter from "../../src/mpModules/customerNote/index.js";
import userLogRouter from "../../src/mpModules/userLog/index.js";
import tripRouter from "../../src/mpModules/trip/index.js";
import marketConfigRouter from "../../src/mpModules/marketConfig/index.js";
import marketSellRouter from "../../src/mpModules/marketSell/index.js";
import adminRouter from "../../src/mpModules/admin/index";
import crawlRouter from "../../src/mpModules/crawl/index";

const mpRouterManager = function (app) {
  app.use("/mp/api/address", addressApiRouter);
  app.use("/mp/api/auth", authApiRouter);
  app.use("/mp/api/role", roleApiRouter);
  app.use("/mp/api/contact-work", contactWorkApiRouter);
  app.use("/mp/api/user", userApiRouter);
  app.use("/mp/api/group-customer", groupCustomerApiRouter);
  app.use("/mp/api/product-category", productCategoryApiRouter);
  app.use("/mp/api/product", productApiRouter);
  app.use("/mp/api/notification", notificationApiRouter);
  app.use("/mp/api/banner", bannerApiRouter);
  app.use("/mp/api/order", orderApiRouter);
  app.use("/mp/api/image", imageApiRouter);
  app.use("/mp/api/customer", customerApiRouter);
  app.use("/mp/api/discount-program", discountProgramApiRouter);
  app.use("/mp/api/configuration", configurationApiRouter);
  app.use("/mp/api/promotion-program", promotionProgramApiRouter);
  app.use("/mp/api/manufacture", manufactureApiRouter);
  app.use("/mp/api/behavior", behaviorLogApiRouter);
  app.use("/mp/api/report", reportApiRouter);
  app.use("/mp/api/store", storeApiRouter);
  app.use("/mp/api/branch", branchApiRouter);
  app.use("/mp/api/group-product", groupProductApiRouter);
  app.use("/mp/api/group-supplier", groupSupplierApiRouter);
  app.use("/mp/api/supplier", supplierApiRouter);
  app.use("/mp/api/specialist", specialistApiRouter);
  app.use("/mp/api/level", levelApiRouter);
  app.use("/mp/api/work-place", workPlaceApiRouter);
  app.use("/mp/api/doctor", doctorApiRouter);
  app.use("/mp/api/medication-category", medicationCategoryApiRouter);
  app.use("/mp/api/health", healthCheckApiRouter);
  app.use("/mp/api/position", positionApiRouter);
  app.use("/mp/api/dosage", dosageApiRouter);
  app.use("/mp/api/country-produce", countryProduceApiRouter);
  app.use("/mp/api/health-facility", healthFacilityApiRouter);
  app.use("/mp/api/prescription", prescriptionApiRouter);
  app.use("/mp/api/batch", batchApiRouter);
  app.use("/mp/api/inbound", inboundApiRouter);
  app.use("/mp/api/sample-prescription", samplePrescriptionApiRouter);
  app.use("/mp/api/purchase-return", purchaseReturnApiRouter);
  app.use("/mp/api/nps", nationalPharmacySystemApiRouter);
  app.use("/mp/api/external/image/upload", imageApiExternalRouter);
  app.use("/mp/api/warehouse", warehouseApiRouter)
  app.use("/mp/api/move", moveApiRouter)
  app.use("/mp/api/sale-return", saleReturnApiRouter)
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocumentation))
  app.use("/mp/api/discount", discountRouter);
  app.use("/mp/api/point", pointRouter);
  app.use("/mp/api/inventory-checking", inventoryCheckingRouter);
  app.use("/mp/api/transaction", transactionRouter);
  app.use("/mp/api/type-transaction", typeTransactionRouter);
  app.use("/mp/api/user-transaction", userTransactionRouter);
  app.use("/mp/api/customer-note", customerNoteRouter);
  app.use("/mp/api/user_log", userLogRouter);
  app.use("/mp/api/trip", tripRouter);
  app.use("/mp/api/market/config", marketConfigRouter);
  app.use("/mp/api/market/sell",marketSellRouter);
  app.use("/mp/api/admin",adminRouter);
  app.use("/mp/api/crawl",crawlRouter);
};

module.exports = mpRouterManager;
