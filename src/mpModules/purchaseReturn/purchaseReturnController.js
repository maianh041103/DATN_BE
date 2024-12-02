import {indexDelete} from "./purchaseReturnService";
import {respondWithClientError} from "../../helpers/response";
import ExcelJS from "exceljs";
import {indexInbounds} from "../inbound/inboundService";
import {inboundStatus} from "../inbound/inboundConstant";
import path from "path";
import fs from "fs";
import {purchaseReturnStatus} from "./purchaseReturnConstant";

const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const {
  readPurchaseReturn,
  indexPurchaseReturns,
  createPurchaseReturn,
  updatePurchaseReturnStatus,
} = require("./purchaseReturnService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexPurchaseReturns(
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
    const result = await createPurchaseReturn(
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
    res.json(respondWithClientError(error))
  }
}

export async function readController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await readPurchaseReturn(id, loginUser);
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
    const result = await updatePurchaseReturnStatus(id, payload, loginUser);
    if (result.success) res.json(respondItemSuccess());
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function indexDeleteController(req, res) {
  try {
    const { id } = req.params;
    const { loginUser = {} } = req;
    const result = await indexDelete(id, loginUser);
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
        respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
    );
  }
}

export async function exportPurchaseReturnController(req, res) {
  try {
    const {loginUser = {}} = req;
    const {page, limit} = req.query;
    const storeId = loginUser.storeId;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = loginUser.name;
    const worksheet = workbook.addWorksheet(`Trả hàng nhập store ${storeId}`);
    let header = [
      {header: "Mã trả hàng nhập", key: "code", width: 25},
      {header: "Thời gian", key: "createdAt", width: 15},
      {header: "Nhà cung cấp", key: "supplierName", width: 15},
      {header: "Tổng tiền hàng trả", key: "totalPrice", width: 25},
      {header: "Giảm giá",key: "discount",width:25},
      {header: "NCC cần trả", key: "totalPaid", width: 10},
      {header: "NCC đã trả", key: "paid", width: 20},
      {header: "Trạng thái", key: "status", width: 20}
    ];
    worksheet.columns = header;
    const result = await indexPurchaseReturns({page,limit},loginUser);
    result.data.items.forEach(item => {
        worksheet.addRow({
          code: item?.code,
          createdAt: item?.createdAt,
          supplierName: item?.supplier?.name,
          totalPrice: item?.totalPrice,
          discount: item?.discount,
          totalPaid: item?.totalPrice - item?.discount,
          paid: item?.paid,
          status:item?.status === purchaseReturnStatus.SUCCEED ? "Đã trả" : "Đã hủy"
        });
    });
    const filePath = path.join(__dirname, `purchase_return_store_${storeId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, `DanhSachTraHangNhap${storeId}.xlsx`, (err) => {
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

export async function exportPurchaseReturnDetailController(req,res){
  try {
    const {loginUser = {}} = req;
    const {page, limit} = req.query;
    const storeId = loginUser.storeId;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = loginUser.name;
    const worksheet = workbook.addWorksheet(`Chi tiết trả hàng nhập store ${storeId}`);
    let header = [
      {header: "Chi nhánh", key: "branchName", width: 25},
      {header: "Mã trả hàng nhập", key: "purchaseReturnCode", width: 15},
      {header: "Thời gian", key: "createdAt", width: 15},
      {header: "Mã nhà cung cấp",key: "supplierCode",width:25},
      {header: "Tên nhà cung cấp", key: "supplierName", width: 10},
      {header: "Điện thoại", key: "supplierPhone", width: 20},
      {header: "Địa chỉ", key: "address", width: 20},
      {header: "Người trả", key: "userName", width: 15},
      {header: "Tổng tiền hàng trả", key: "totalPrice", width: 15},
      {header: "Giảm giá", key: "discount", width: 30},
      {header: "Chi phí nhập hoàn lại", key: "discount", width: 15},
      {header: "NCC cần trả", key: "totalPaid", width: 10},
      {header: "Tiền NCC trả", key: "paid", width: 10},
      {header: "Người tạo", key: "createdByName", width: 10},
      {header: "Ghi chú", key: "note", width: 10},
      {header: "Tổng số lượng", key: "totalProduct", width: 30},
      {header: "Tổng số mặt hàng", key: "totalQuantity", width: 15},
      {header: "Trạng thái", key: "status", width: 10},
      {header: "Mã hàng", key: "productCode", width: 15},
      {header: "Tên hàng", key: "productName", width: 10},
      {header: "Giá nhập", key: "primePriceItem", width: 10},
      {header: "ĐVT", key: "unitName", width: 10},
      {header: "Giá trả lại", key: "priceItem", width: 10},
      {header: "Số lượng", key: "totalItem", width: 10},
      {header: "Giảm giá trả lại", key: "discountItem", width: 10},
      {header: "Thành tiền", key: "totalPriceItem", width: 10}
    ];
    worksheet.columns = header;
    const result = await indexPurchaseReturns({page,limit},loginUser);
    let tmp = [];
    result.data.items.forEach(item => {
      for(const inboundProduct of item.products) {
        let row = {
          branchName: item?.branch?.name,
          purchaseReturnCode: item.code,
          createdAt: item.createdAt,
          supplierCode:item?.supplier?.code,
          supplierName:item?.supplier?.name,
          supplierPhone:item?.supplier?.phone,
          address:item?.supplier?.address,
          userName:item?.user?.username,
          totalPrice:item?.totalPrice,
          discount:item?.discount,
          totalPaid:item?.totalPrice - item?.discount,
          paid:item?.paid,
          createdByName:item.creator?.fullName,
          note:item?.description,
          totalProduct:item?.dataValues?.countProduct,
          totalQuantity: item?.dataValues?.quantityProduct,
          status:item?.status === purchaseReturnStatus.SUCCEED ? "Đã trả hàng" : "Chưa trả hàng",
          productCode:inboundProduct?.product?.code,
          productName:inboundProduct?.product?.name,
          primePriceItem:inboundProduct?.product?.primePrice,
          unitName:inboundProduct?.productUnit?.unitName,
          priceItem:inboundProduct?.importPrice,
          totalItem:inboundProduct?.quantity,
          discountItem:inboundProduct?.discount,
          totalPriceItem:parseInt(inboundProduct?.quantity) * parseInt(inboundProduct?.importPrice)
        }
        for(let i = 0;i<inboundProduct?.batches?.length;i++){
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
        tmp.push(row);
        worksheet.addRow(row);
      }
    });
    const filePath = path.join(__dirname, `purchase_return_store_${storeId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    // res.json({
    //   data:tmp
    // })
    res.download(filePath, `DanhSachChiTietTraHangNhap${storeId}.xlsx`, (err) => {
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