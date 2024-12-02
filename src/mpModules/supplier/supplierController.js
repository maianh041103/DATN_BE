import uploadFile from "../../helpers/upload";
import xlsx from "xlsx";
import {indexCustomers, uploadFileCreateCustomerService} from "../customer/customerService";
import path from "path";
import {authenticate} from "../../middlewares/auth";
import {authorize} from "../../middlewares/authorize";
import ExcelJS from "exceljs";
import fs from "fs";

const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readSupplier,
  indexSuppliers,
  updateSupplier,
  createSupplier,
  deleteSupplier,
  indexPaymentSupplier,
  uploadFileCreateSupplierService
} = require("./supplierService");
const {
  indexSupplierDebt
} = require("./supplierDebtService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexSuppliersController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexSuppliers({ ...req.query, storeId: loginUser.storeId });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function createSupplierController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await createSupplier({
      name: _.get(req.body, "name", ""),
      phone: _.get(req.body, "phone", ""),
      email: _.get(req.body, "email", ""),
      code: _.get(req.body, "code", ""),
      taxCode: _.get(req.body, "taxCode", ""),
      wardId: _.get(req.body, "wardId", null),
      districtId: _.get(req.body, "districtId", null),
      provinceId: _.get(req.body, "provinceId", null),
      storeId: loginUser.storeId,
      branchId: _.get(req.body, "branchId", null),
      groupSupplierId: _.get(req.body, "groupSupplierId", null),
      address: _.get(req.body, "address", ""),
      companyName: _.get(req.body, "companyName", ""),
      note: _.get(req.body, "note", ""),
      createdBy: loginUser.id,
      createdAt: new Date(),
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function readSupplierController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readSupplier(id, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function updateSupplierController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const status = _.get(req.body, "status", null);
    const supplier = {
      name: _.get(req.body, "name", ""),
      phone: _.get(req.body, "phone", ""),
      email: _.get(req.body, "email", ""),
      code: _.get(req.body, "code", ""),
      taxCode: _.get(req.body, "taxCode", ""),
      wardId: _.get(req.body, "wardId", null),
      districtId: _.get(req.body, "districtId", null),
      provinceId: _.get(req.body, "provinceId", null),
      branchId: _.get(req.body, "branchId", null),
      storeId: loginUser.storeId,
      groupSupplierId: _.get(req.body, "groupSupplierId", null),
      address: _.get(req.body, "address", ""),
      companyName: _.get(req.body, "companyName", ""),
      note: _.get(req.body, "note", ""),
      ...(status !== null && { status }),
      updatedBy: loginUser.id,
      updatedAt: new Date(),
    };
    const result = await updateSupplier(id, supplier);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function deleteSupplierController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteSupplier(id, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function getTotalDebtController(req, res) {
  try {
    const { loginUser = {} } = req;
    const { id } = req.params;
    const result = await indexSupplierDebt({
      ...req.query,
      storeId: loginUser.storeId,
      supplierId: id
    });
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexPaymentSupplierController(req, res) {
  try {
    const { supplierId } = req.params;
    const result = await indexPaymentSupplier({ ...req.query, supplierId });
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export  async function createUploadKiotvietController(req,res){
  try {
    const {loginUser = {}} = req;
    await uploadFile(req, res);
    if (req.file === undefined) {
      return res.status(400).send({message: 'Please upload a file!'});
    }
    // Đường dẫn tạm thời của tệp Excel đã tải lên
    const excelFilePath = req.file.path;

    // Đọc dữ liệu từ tệp Excel
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const result = await uploadFileCreateSupplierService(data, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
        respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function exportSupplierExampleController(req,res){
  try {
    const tmp = path.resolve(__dirname, '../../../')
    const filePath = path.join(tmp, 'excel', `supplier.xlsx`);
    // Sử dụng res.download để gửi file và xóa file sau khi gửi
    res.download(filePath, `MauFileNhaCungCap.xlsx`, (err) => {
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

export async function exportSupplierController(req, res) {
  try {
    const {loginUser = {}} = req;
    const {page, limit} = req.query;
    const storeId = loginUser.storeId;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = loginUser.name;
    const worksheet = workbook.addWorksheet(`Danh sách nhà cung cấp cửa hàng ${storeId}`);
    worksheet.columns = [
      {header: "Tên nhà cung cấp", key: "name", width: 25},
      {header: "Điện thoại", key: "phone", width: 15},
      {header: "Mã nhà cung cấp", key: "code", width: 15},
      {header: "Email", key: "email", width: 25},
      {header: "Địa chỉ", key: "address", width: 25},
      {header: "Khu vực giao hàng", key: "provinceNameAndDistrictName", width: 25},
      {header: "Phường/Xã", key: "wardName", width: 25},
      {header: "Tổng mua", key: "totalPrice", width: 20},
      {header: "Nợ cần trả hiện tại", key: "debt", width: 20},
      {header: "Mã số thuế", key: "taxCode", width: 20},
      {header: "Ghi chú", key: "note", width: 30},
      {header: "Nhóm nhà cung cấp", key: "groupSupplierName", width: 25},
      {header: "Trạng thái", key: "status", width: 10},
      {header: "Tổng mua trừ trả hàng", key: "totalPriceAndPurchaseReturn", width: 25},
      {header: "Công ty", key: "company", width: 20},
      {header: "Người tạo", key: "createdBy", width: 20},
      {header: "Ngày tạo", key: "createdAt", width: 20},
    ];
    const result = await indexSuppliers({storeId, page, limit});
    result.data.items.forEach(item => {
      worksheet.addRow({
        name: item?.name,
        phone: item?.phone,
        code: item?.code,
        email: item?.email,
        address: item?.address,
        provinceNameAndDistrictName:`${item?.province?.name}-${item?.district?.name}`,
        wardName:item?.ward?.name,
        totalPrice:parseInt(item.dataValues.totalPrice),
        debt:parseInt(item.dataValues.totalDebt) - parseInt(item.dataValues.totalPurchaseDebt),
        taxCode: item.taxCode,
        note: item?.note,
        groupSupplierName:item?.groupSupplier?.name,
        status: item?.status,
        totalPriceAndPurchaseReturn : parseInt(item.dataValues.totalPrice) - parseInt(item.dataValues.totalPurchasePrice),
        company:item?.companyName,
        createdBy:item?.created_by?.username,
        createdAt:item?.createdAt,
      });
    });
    const filePath = path.join(__dirname, `supplier_store_${storeId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, `DanhSachNhaCungCap${storeId}.xlsx`, (err) => {
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


