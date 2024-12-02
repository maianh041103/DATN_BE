import {findPriceOrderProduct, indexCreate, indexList, indexPayment, readHistory} from "./saleReturnService";
import ExcelJS from "exceljs";
import {indexInbounds} from "../inbound/inboundService";
import {inboundStatus} from "../inbound/inboundConstant";
import path from "path";
import fs from "fs";

const _ = require("lodash");
const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function indexController(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexList(
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
    const result = await indexCreate(
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

export async function readPaymentController(req, res) {
  try {
    const { id: orderId } = req.params
    const result = await indexPayment({ ...req.query, orderId });
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithClientError(error))
  }
}

export async function readHistoryController(req, res) {
  try {
    const { id: saleReturnId } = req.params
    const result = await readHistory(req.query, saleReturnId);
    if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
  }
}

export async function exportExcelController(req, res) {
  try {
    const {loginUser = {}} = req;
    const {page, limit} = req.query;
    const storeId = loginUser.storeId;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = loginUser.name;
    const worksheet = workbook.addWorksheet(`Trả hàng store ${storeId}`);
    let header = [
      {header: "Chi nhánh", key: "branchName", width: 25},
      {header: "Mã trả hàng", key: "saleReturnCode", width: 15},
      {header: "Thời gian tạo", key: "createdAt", width: 15},
      {header: "Mã hóa đơn", key: "orderCode", width: 25},
      {header: "Người bán",key: "orderUserName",width:25},
      {header: "Mã khách hàng", key: "customerCode", width: 10},
      {header: "Tên khách hàng", key: "customerName", width: 20},
      {header: "Người nhận trả", key: "saleReturnUserName", width: 20},
      {header: "Người tạo", key: "createdBy", width: 15},
      {header: "Ghi chú", key: "note", width: 30},
      {header: "Tổng tiền hàng trả", key: "totalPrice", width: 15},
      {header: "Giảm giá phiếu trả", key: "discount", width: 10},
      {header: "Phí trả hàng", key: "retrunFee", width: 10},
      {header: "Cần trả khách", key: "totalPaid", width: 10},
      {header: "Đã trả khách", key: "paid", width: 30},
      {header: "Tiền mặt", key: "cash", width: 15},
      {header: "Chuyển khoản", key: "bank", width: 15},
      {header: "Điểm", key: "point", width: 10},
      {header: "Trạng thái", key: "status", width: 15},
      {header: "Mã hàng", key: "productCode", width: 10},
      {header: "Tên hàng", key: "productName", width: 10},
      {header: "ĐVT", key: "unitName", width: 10},
      {header: "Số lượng", key: "totalQuantity", width: 10},
      {header: "Giá bán", key: "orderPrice", width: 10},
      {header: "Giá nhập lại", key: "saleReturnPrice", width: 10}
    ];
    worksheet.columns = header;
    const result = await indexList({page:1,limit:20},loginUser);
    let tmp = [];
    result.data.items.forEach(item => {
      for(const saleReturnProduct of item.items) {
        let row = {
          branchName: item?.branch?.name,
          saleReturnCode: item.code,
          createdAt: item.createdAt,
          orderCode:item?.order.code,
          orderUserName:item?.order.creator.username,
          customerCode:item?.customer?.code,
          customerName:item?.customer?.fullName,
          saleReturnUserName:item?.user?.username,
          createdBy:item?.creator?.username,
          note:item?.description,
          totalPrice:parseInt(item?.totalPrice) - parseInt(item?.discount),
          discount:item?.discount,
          retrunFee:item?.returnFee,
          totalPaid:item?.totalPrice - item?.discount,
          paid: item?.paid,
          cash: (item?.paymentType === "CASH") ? item?.paid : 0,
          bank: (item?.paymentType === "BANK") ? item?.paid : 0,
          point: saleReturnProduct?.point,
          status:item.status === "SUCCEED" ? "Đã trả hàng" : "Đang tạo phiếu nháp trả hàng",
          productCode: saleReturnProduct?.productUnit?.product?.code,
          productName:saleReturnProduct?.productUnit?.product?.name,
          unitName:saleReturnProduct?.productUnit?.unitName,
          totalQuantity:saleReturnProduct?.quantity,
          orderPrice:saleReturnProduct.dataValues.orderPrice,
          saleReturnPrice:saleReturnProduct?.price,
        }

        for(let i = 0;i<saleReturnProduct.batches.length;i++){
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
          row[batchKey] = saleReturnProduct?.batches[i]?.batch?.name;
          row[expiryDateKey] = saleReturnProduct?.batches[i]?.batch?.expiryDate;
          row[inventoryKey] = saleReturnProduct?.batches[i]?.quantity;
        }
        worksheet.addRow(row);
        tmp.push(row);
      }
    });
    const filePath = path.join(__dirname, `sale_return_store_${storeId}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, `DanhSachTraHang_${storeId}.xlsx`, (err) => {
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