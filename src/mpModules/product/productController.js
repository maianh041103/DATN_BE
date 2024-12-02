import { detailMaster } from "./productMasterService";

import path from "path";
import ExcelJS from "exceljs";
import {indexDoctors} from "../doctor/doctorService";
import fs from "fs";
const uploadFile = require("../../helpers/upload");
const _ = require("lodash");
const xlsx = require("xlsx");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readProduct,
  indexProducts,
  indexProductCombo,
  updateProduct,
  createProduct,
  deleteProductById,
  updateproductStatuses,
  deleteManyProducts,
  updateEndDateManyProducts,
  uploadFileService,
  uploadFileKiotVietService
} = require("./productService");
const {
  indexProductPriceSettings,
  updateProductPriceSetting,
} = require("./productPriceSetting");
const { productStatuses } = require("./productConstant");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const {
  indexMasterSaleProducts,
  indexMasterInboundProducts,
} = require("./productMasterService");

export async function indexMasterInboundProductController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexMasterInboundProducts({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexMasterSaleProductController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexMasterSaleProducts({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error);
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexDetailController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await detailMaster({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error);
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexProducts({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexPriceSettingController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexProductPriceSettings({
      ...req.query,
      storeId: loginUser.storeId,
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createController(req, res) {
  try {
    const { loginUser = {} } = req;
    const warningExpiryDate = _.get(req.body, "warningExpiryDate", null);
    const product = {
      name: _.get(req.body, "name", ""),
      slug: _.get(req.body, "slug", ""),
      drugCode: _.get(req.body, "drugCode", ""),
      code: _.get(req.body, "code", ""),
      barCode: _.get(req.body, "barCode", ""),
      shortName: _.get(req.body, "shortName", ""),
      groupProductId: _.get(req.body, "groupProductId", null),
      primePrice: _.get(req.body, "primePrice", 0),
      price: _.get(req.body, "price", null),
      weight: _.get(req.body, "weight", ""),
      ...(warningExpiryDate && { warningExpiryDate }),
      warningExpiryText: _.get(req.body, "warningExpiryText", null),
      isDirectSale: _.get(req.body, "isDirectSale", false),
      registerNumber: _.get(req.body, "registerNumber", null),
      activeElement: _.get(req.body, "activeElement", null),
      content: _.get(req.body, "content", null),
      packingSpecification: _.get(req.body, "packingSpecification", null),
      manufactureId: _.get(req.body, "manufactureId", null),
      countryId: _.get(req.body, "countryId", null),
      minInventory: _.get(req.body, "minInventory", 0),
      maxInventory: _.get(req.body, "maxInventory", 999999999),
      description: _.get(req.body, "description", ""),
      note: _.get(req.body, "note", ""),
      status: _.get(req.body, "status", productStatuses.ACTIVE),
      imageId: _.get(req.body, "imageId", null),
      type: _.get(req.body, "type", null),
      storeId: loginUser.storeId,
      branchId: _.get(req.body, "branchId", null),
      dosageId: _.get(req.body, "dosageId", null),
      positionId: _.get(req.body, "positionId", null),
      isLoyaltyPoint: _.get(req.body, "isLoyaltyPoint", false),
      isBatchExpireControl: _.get(req.body, "isBatchExpireControl", false),
      expiryPeriod: _.get(req.body, "expiryPeriod", null),
      inventory: _.get(req.body, "inventory", 0),
      baseUnit: _.get(req.body, "baseUnit", null),
      productUnits: _.get(req.body, "productUnits", []),
      createdBy: loginUser.id,
      createdAt: new Date(),
    };
    const result = await createProduct(product, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function readController(req, res) {
  try {
    const { id } = req.params;
    const result = await readProduct(id);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updateController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const status = _.get(req.body, "status", null);
    const warningExpiryDate = _.get(req.body, "warningExpiryDate", null);
    const product = {
      name: _.get(req.body, "name", ""),
      slug: _.get(req.body, "slug", ""),
      code: _.get(req.body, "code", ""),
      barCode: _.get(req.body, "barCode", ""),
      shortName: _.get(req.body, "shortName", ""),
      groupProductId: _.get(req.body, "groupProductId", null),
      primePrice: _.get(req.body, "primePrice", 0),
      price: _.get(req.body, "price", null),
      weight: _.get(req.body, "weight", ""),
      ...(warningExpiryDate && { warningExpiryDate }),
      warningExpiryText: _.get(req.body, "warningExpiryText", null),
      isDirectSale: _.get(req.body, "isDirectSale", false),
      registerNumber: _.get(req.body, "registerNumber", null),
      activeElement: _.get(req.body, "activeElement", null),
      content: _.get(req.body, "content", null),
      packingSpecification: _.get(req.body, "packingSpecification", null),
      manufactureId: _.get(req.body, "manufactureId", null),
      countryId: _.get(req.body, "countryId", null),
      minInventory: _.get(req.body, "minInventory", null),
      maxInventory: _.get(req.body, "maxInventory", null),
      description: _.get(req.body, "description", ""),
      note: _.get(req.body, "note", ""),
      ...(status !== null && { status }),
      imageId: _.get(req.body, "imageId", null),
      type: _.get(req.body, "type", null),
      storeId: loginUser.storeId,
      branchId: _.get(req.body, "branchId", null),
      dosageId: _.get(req.body, "dosageId", null),
      positionId: _.get(req.body, "positionId", null),
      isLoyaltyPoint: _.get(req.body, "isLoyaltyPoint", false),
      isBatchExpireControl: _.get(req.body, "isBatchExpireControl", false),
      inventory: _.get(req.body, "inventory", 0),
      baseUnit: _.get(req.body, "baseUnit", null),
      productUnits: _.get(req.body, "productUnits", []),
      updatedBy: loginUser.id,
      updatedAt: new Date(),
    };
    const result = await updateProduct(id, product, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const status = _.get(req.body, "status", null);
    const product = {
      ...(status !== null && { status }),
      updatedBy: loginUser.id,
    };
    const result = await updateproductStatuses(id, product, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteProductById(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function deleteProducts(req, res) {
  try {
    const { ids } = req.body;
    const { loginUser = {} } = req;
    const result = await deleteManyProducts(ids, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updateEndDateProducts(req, res) {
  try {
    const { ids, endDate, endMonth } = req.body;
    const result = await updateEndDateManyProducts(
      ids,
      endDate,
      endMonth,
      loginUser.id
    );
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function updatePriceSettingController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const type = _.get(req.body, "type", null);
    const value = _.get(req.body, "value", 0);
    const isApplyForAll = _.get(req.body, "isApplyForAll", false);
    const branchId = _.get(req.body, "branchId", null);
    const result = await updateProductPriceSetting(
      id,
      {
        type,
        value,
        isApplyForAll,
        branchId,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error);
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createUploadController(req, res) {
  try {
    const { loginUser = {} } = req;
    // Upload file
    await uploadFile(req, res);
    // Check if file is uploaded
    if (req.file === undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    const excelFilePath = req.file.path;
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    const branchId = req.query.branchId;
    const result = await uploadFileService(
        loginUser,data,branchId
    );
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));


  } catch (error) {
    console.error("Error in createUploadController:", error);
    return res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function exportProductController(req, res) {
  try {
    const {loginUser = {}} = req;
    const storeId = loginUser.storeId;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = loginUser.name;
    const worksheet = workbook.addWorksheet(`Danh sách sản phẩm`);
    let header = [
      {header: "Loại sản phẩm", key: "type", width: 15},
      {header: "Mã hàng", key: "code", width: 15},
      {header: "Mã vạch", key: "barCode", width: 20},
      {header: "Mã thuốc", key: "drugCode", width: 15},
      {header: "Tên sản phẩm", key: "name", width: 25},
      {header: "Tên viết tắt", key: "shortName", width: 15},
      {header: "Nhóm sản phẩm", key: "groupProductName", width: 15},
      {header: "Vị trí", key: "positionName", width: 15},
      {header: "Đường dùng", key: "dosageName", width: 15},
      {header: "Giá vốn", key: "primePrice", width: 15},
      {header: "Giá bán", key: "price", width: 15},
      {header: "Trọng lượng", key: "weight", width: 15},
      {header: "Quy cách đóng gói", key: "packingSpecification", width: 30},
      {header: "Hãng sản xuất", key: "manufactureName", width: 30},
      {header: "Nước sản xuẩt", key: "country", width: 15},
      {header: "Tồn kho", key: "inventory", width: 15},
      {header: "Điểm", key: "point", width: 15},
      {header: "Có lô không", key: "isBatchExpireControl", width: 15},
      {header: "Cảnh báo ngày hết hạn", key: "expiryPeriod", width: 15},
      {header: "Bán trực tiếp", key: "isDirectSale", width: 15},
      {header: "Đơn vị cơ bản", key: "baseUnit", width: 15},
      {header: "Tích điểm không", key: "isLoyaltyPoint", width: 15},
      {header: "Tồn kho nhỏ nhất", key: "minInventory", width: 15},
      {header: "Tồn kho lớn nhất", key: "maxInventory", width: 15},
      {header: "Mô tả", key: "description", width: 45},
      {header: "Mẫu ghi chú", key: "note", width: 45},
      {header: "Trạng thái", key: "status", width: 15},
    ];
    for(let i = 1;i <= 30; i++){
      header.push(
        {header: `Đơn vị ${i}`, key: `unitName${i}`, width: 15},
        {header: `Quy đổi ${i}`, key: `exchangeValue${i}`, width: 15},
        {header: `Giá bán ${i}`, key: `price${i}`, width: 15},
        {header: `Mã hàng ${i}`, key: `code${i}`, width: 15},
        {header: `Điểm ${i}`, key: `point${i}`, width: 15}
      );
    }
    worksheet.columns = header;
    const result = await indexProducts({storeId, ...req.query});
    result.data.items.forEach(item => {
      let row = {
        type: item.type,
        code: item.code,
        barCode: item.barCode,
        drugCode: item.drugCode,
        name:item.name,
        shortName: item.shortName,
        groupProductName:item?.groupProduct?.name,
        positionName: item?.productPosition?.name,
        dosageName: item?.productDosage?.name,
        primePrice: item?.primePrice,
        price: item?.price,
        weight: item?.weight,
        packingSpecification: item?.packingSpecification,
        manufactureName: item?.productManufacture?.name,
        country: item?.country?.name,
        inventory: item?.inventory,
        point: item?.point,
        isBatchExpireControl: item?.isBatchExpireControl === false ? item.isBatchExpireControl = 0 : item.isBatchExpireControl = 1,
        expiryPeriod: item?.expiryPeriod,
        isDirectSale: item?.isDirectSale === false ? item.isDirectSale = 0 : item.isDirectSale = 1,
        baseUnit: item?.baseUnit,
        isLoyaltyPoint: item?.isLoyaltyPoint === false ? item.isLoyaltyPoint = 0 : item.isLoyaltyPoint = 1,
        minInventory: item?.minInventory,
        maxInventory: item?.maxInventory,
        description: item?.description,
        note: item?.note,
        status: item?.status
      }
      const listProductUnit = item?.productUnit?.filter(tmp=>tmp.isBaseUnit === false);
      for(let i = 0;i<listProductUnit.length;i++){
        row[`unitName${i + 1}`] = listProductUnit[i].unitName;
        row[`exchangeValue${i + 1}`] = listProductUnit[i].exchangeValue;
        row[`price${i+1}`] = listProductUnit[i].price;
        row[`code${i+1}`] = listProductUnit[i].code;
        row[`point${i+1}`] = listProductUnit[i].point;
      }
      worksheet.addRow(row);
    });
    const filePath = path.join(__dirname, `product_export.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    // Sử dụng res.download để gửi file và xóa file sau khi gửi
    res.download(filePath, `Danhsachsanpham.xlsx`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      } else {
        console.log('File sent successfully');
        fs.unlinkSync(filePath); // Xóa file sau khi gửi
      }
    });
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function exportProductExampleController(req,res){
  try {
    const type = req.query.type || "";
    const tmp = path.resolve(__dirname, '../../../')
    const filePath = path.join(tmp, 'excel',`product${type}.xlsx`);
    // Sử dụng res.download để gửi file và xóa file sau khi gửi
    res.download(filePath, `Maufilesanpham${type}.xlsx`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      } else {
        console.log('File sent successfully');
      }
    });
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function createUploadKiotvietController(req, res) {
  try {
    const { loginUser = {} } = req;
    // Upload file
    await uploadFile(req, res);
    // Check if file is uploaded
    if (req.file === undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    const excelFilePath = req.file.path;
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    const branchId = req.query.branchId;
    const result = await uploadFileKiotVietService(
        loginUser,data,branchId
    );
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));


  } catch (error) {
    console.error("Error in createUploadController:", error);
    return res.json(
        respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}
