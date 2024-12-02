import { deleteInbound } from "./inboundService";
import ExcelJS from "exceljs";
import {indexCustomers} from "../customer/customerService";
import path from "path";
import fs from "fs";
import {inboundStatus} from "./inboundConstant";

const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readInbound,
  indexInbounds,
  createInbound,
  updateInboundStatus,
} = require("./inboundService");
const {
  createPaymentAndTransaction
} = require("./inboundPaymentService");

const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexInbounds(
      {
        ...req.query,
        storeId: loginUser.storeId,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
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
    const result = await createInbound(
      {
        ...req.body,
        storeId: loginUser.storeId,
        createdBy: loginUser.id,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    console.log(error)
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function readController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readInbound(id, loginUser);
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
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
    const payload = {
      status: _.get(req, "body.status", null),
      updatedBy: loginUser.id,
    };
    const result = await updateInboundStatus(id, payload, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexDelete(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await deleteInbound(id, loginUser);
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function createPaymentController(req, res) {
  try {
    const { loginUser = {} } = req;
    const { id } = req.params
    const result = await createPaymentAndTransaction(
      {
        ...req.body,
        inboundId: id,
        storeId: loginUser.storeId,
        createdBy: loginUser.id,
      },
      loginUser
    );
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function exportInboundController(req,res){
  try {
    const {loginUser = {}} = req;
    const {page, limit} = req.query;
    const storeId = loginUser.storeId;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = loginUser.name;
    const worksheet = workbook.addWorksheet(`Chi tiết nhập hàng store ${storeId}`);
    let header = [
      {header: "Chi nhánh", key: "branchName", width: 25},
      {header: "Mã nhập hàng", key: "inboundCode", width: 15},
      {header: "Thời gian tạo", key: "createdAt", width: 15},
      {header: "Ngày cập nhật", key: "updatedAt", width: 25},
      {header: "Mã nhà cung cấp",key: "supplierCode",width:25},
      {header: "Tên nhà cung cấp", key: "supplierName", width: 10},
      {header: "Điện thoại", key: "supplierPhone", width: 20},
      {header: "Địa chỉ", key: "address", width: 20},
      {header: "Người tạo", key: "createdByName", width: 15},
      {header: "Giảm giá phiếu nhập", key: "discount", width: 15},
      {header: "Cần trả NCC", key: "totalPaid", width: 30},
      {header: "Tiền đã trả NCC", key: "paid", width: 15},
      {header: "Ghi chú", key: "note", width: 10},
      {header: "Tổng số lượng", key: "totalQuantity", width: 10},
      {header: "Tổng số mặt hàng", key: "totalProduct", width: 10},
      {header: "Trạng thái", key: "status", width: 10},
      {header: "Mã hàng", key: "productCode", width: 30},
      {header: "Tên hàng", key: "productName", width: 15},
      {header: "ĐVT", key: "unitName", width: 10},
      {header: "Đơn giá", key: "priceItem", width: 15},
      {header: "Giảm giá", key: "discountItem", width: 10},
      {header: "Giá nhập", key: "primePriceItem", width: 10},
      {header: "Thành tiền", key: "totalPrice", width: 10},
      {header: "Số lượng", key: "quantity", width: 10}
    ];
    worksheet.columns = header;
    const result = await indexInbounds({page,limit},loginUser);
    result.data.items.forEach(item => {
      for(const inboundProduct of item.inboundProducts) {
        let row = {
          branchName: item?.branch?.name,
          inboundCode: item.code,
          createdAt: item.createdAt,
          updatedAt:item.updatedAt,
          supplierCode:item?.supplier?.code,
          supplierName:item?.supplier?.name,
          supplierPhone:item?.supplier?.phone,
          address:item.address,
          createdByName:item?.creator?.username,
          discount:item.discount,
          totalPaid:parseInt(item.totalPrice) - parseInt(item.discount),
          paid:item.paid,
          note:item.description,
          totalQuantity:item.dataValues.quantityProduct,
          totalProduct:item.dataValues.countProduct,
          status:item.status === inboundStatus.SUCCEED ? "Đã nhập hàng" : "Đang nhập hàng",
          productCode: inboundProduct?.product.code,
          productName:inboundProduct?.product.name,
          unitName:inboundProduct?.productUnit?.unitName,
          priceItem:inboundProduct.price,
          discountItem:inboundProduct.discount,
          primePriceItem:inboundProduct?.product.primePrice,
          totalPrice:item.totalPrice,
          quantity:inboundProduct.quantity
        }
        for(let i = 0;i<inboundProduct.batches.length;i++){
          const batchKey = `batch${i + 1}`;
          const expiryDateKey = `expiryDate${i + 1}`;
          const inventoryKey = `inventory${i + 1}`;

          if (!header.find(column => column.key === batchKey)) {
            header.push({ header: `Lô_${i + 1}`, key: batchKey, width: 10 });
            header.push({ header: `Hạn sử dụng_${i + 1}`, key: expiryDateKey, width: 10 });
            header.push({ header: `Số lượng_${i + 1}`, key: inventoryKey, width: 10 });

            // Cập nhật worksheet.columns
            worksheet.columns = header; // Cập nhật worksheet.columns
          }
          row[batchKey] = inboundProduct?.batches[i]?.batch?.name;
          row[expiryDateKey] = inboundProduct?.batches[i]?.batch?.expiryDate;
          row[inventoryKey] = inboundProduct?.batches[i]?.quantity;
        }
        worksheet.addRow(row);
      }
    });
    const filePath = path.join(__dirname, `inbound_store_${storeId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, `DanhSachChiTietNhapHang.xlsx`, (err) => {
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