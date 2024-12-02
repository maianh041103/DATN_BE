import {indexCreate, readMove, indexList, receiveMove} from "./moveService";
import {respondWithClientError} from "../../helpers/response";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

const _ = require("lodash");
const {
    respondItemSuccess,
    respondWithError,
} = require("../../helpers/response");
const { HttpStatusCode } = require("../../helpers/errorCodes");
const constant = require("./constant");

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
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

export async function createController(req, res) {
    try {
        const { loginUser = {} } = req;
        const result = await indexCreate(
            {
                ...req.body,
                storeId: loginUser.storeId,
            },
            loginUser
        );
        if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

export async function readController(req, res) {
    try {
        const { id } = req.params;
        const { loginUser = {} } = req;
        const result = await readMove(id, loginUser);
        if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (e) {
        res.json(respondWithClientError(e))
    }
}

export async function receiveController(req, res) {
    try {
        const { id } = req.params;
        const { loginUser = {} } = req;
        const result = await receiveMove(id, req.body, loginUser);
        if (result.success) res.json(respondItemSuccess(result));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

//...?branchId=
export async function exportMoveController(req, res) {
    try {
        const {loginUser = {}} = req;
        const storeId = loginUser.storeId;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = loginUser.name;
        const worksheet = workbook.addWorksheet(`Danh sách chuyển hàng ${storeId}`);
        worksheet.columns = [
            {header: "Mã chuyển hàng", key: "code", width: 25},
            {header: "Ngày chuyển", key: "movedAt", width: 25},
            {header: "Ngày nhận", key: "receivedAt", width: 25},
            {header: "Từ chi nhánh", key: "fromBranchId", width: 40},
            {header: "Tới chi nhánh",key: "toBranchId",width:40},
            {header: "Giá trị chuyển", key: "totalPrice", width: 20},
            {header: "Trạng thái",key: "status",width:20}
        ];
        const result = await indexList({ page : 1, limit : 10**10, ...req.query}, loginUser);
        result.data.items.forEach(item => {
            if(item.status){
                if(item.status === constant.moveStatus.MOVING){
                    item.status = "Đang vận chuyển";
                }else if(item.status === constant.moveStatus.RECEIVED){
                    item.status = "Đã nhận";
                }else{
                    item.status = "Không nhận"
                }
            }
            worksheet.addRow({
                code: item.code,
                movedAt: item.movedAt,
                receivedAt: item.receivedAt,
                fromBranchId: item?.fromBranch?.name,
                toBranchId:item?.toBranch?.name,
                totalPrice: item.totalPrice,
                status: item.status
            });
        });
        const filePath = path.join(__dirname, `move_store_${storeId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, `Danhsachchuyenhang.xlsx`, (err) => {
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

//...?branchId=
export async function exportMoveDetailController(req, res) {
    try {
        const {loginUser = {}} = req;
        const storeId = loginUser.storeId;
        const {branchId} = req.query;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = loginUser.name;
        const worksheet = workbook.addWorksheet(`Danh sách chi tiết chuyển hàng ${storeId}`);
        let header = [
            {header: "Mã chuyển hàng", key: "code", width: 25},
            {header: "Loại phiếu", key: "type", width: 25},
            {header: "Từ chi nhánh", key: "fromBranch", width: 25},
            {header: "Tới chi nhánh", key: "toBranch", width: 40},
            {header: "Ngày chuyển",key: "movedAt",width:40},
            {header: "Thời gian tạo", key: "createdAt", width: 20},
            {header: "Ngày nhận",key: "receivedAt",width:20},
            {header: "Người tạo", key: "movedBy", width: 25},
            {header: "Ghi chú chuyển", key: "note", width: 25},
            {header: "Ghi chú nhận", key: "receiveNote", width: 25},
            {header: "Tổng SL chuyển", key: "totalCountMoved", width: 40},
            {header: "Tổng giá trị chuyển",key: "totalPriceMoved",width:40},
            {header: "Tổng SL nhận", key: "totalCountReceived", width: 20},
            {header: "Tổng giá trị nhận",key: "totalPriceReceived",width:20},
            {header: "Tổng số mặt hàng", key: "totalCountProduct", width: 25},
            {header: "Trạng thái", key: "status", width: 25},
            {header: "Mã hàng", key: "productCode", width: 25},
            {header: "ĐVT", key: "unit", width: 40},
            {header: "Tên hàng",key: "productName",width:40},
            {header: "Số lượng chuyển", key: "countMoved", width: 25},
            {header: "Số lượng nhận", key: "countRecevied", width: 25},
            {header: "Giá chuyển/nhận",key: "price",width:40},
            {header: "Thành tiền chuyển", key: "priceMoved", width: 20},
            {header: "Thành tiền nhận",key: "priceReceived",width:20}
        ];
        worksheet.columns = header;
        const result = await indexList({ page : 1, limit : 10**10, ...req.query}, loginUser);
        result.data.items.forEach(item => {
            if(item.status){
                if(item.status === constant.moveStatus.MOVING){
                    item.status = "Đang vận chuyển";
                }else if(item.status === constant.moveStatus.RECEIVED){
                    item.status = "Đã nhận";
                }else{
                    item.status = "Không nhận"
                }
            }
            for(const productMove of item?.items){
                let row = {
                    code: item.code,
                    type: item.fromBranchId === branchId ? "Chuyển hàng" : "Nhận hàng",
                    fromBranch: item?.fromBranch?.name,
                    toBranch:item?.toBranch?.name,
                    movedAt: item.movedAt,
                    createdAt: item.createdAt,
                    receivedAt: item.receivedAt,
                    movedBy: item?.movedByUser?.fullName,
                    note: item.note,
                    receiveNote: item.receiveNote,
                    totalCountMoved: item?.dataValues?.totalCountMoved,
                    totalPriceMoved: item?.dataValues?.totalPriceMoved,
                    totalCountReceived: item?.dataValues?.totalCountReceived,
                    totalPriceReceived: item?.dataValues?.totalPriceReceived,
                    totalCountProduct: item?.items?.length,
                    status: item.status,
                    productCode: productMove?.product?.code,
                    unit: productMove?.productUnit?.unitName,
                    productName: productMove?.product?.name,
                    countMoved: productMove.quantity,
                    countRecevied: productMove.toQuantity,
                    price: productMove.price,
                    priceMoved: productMove.quantity * productMove.price,
                    priceReceived: productMove.toQuantity * productMove.price
                };

                for(let i = 0;i < productMove?.fromBatches?.length;i++){
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
                    row[batchKey] = productMove?.fromBatches[i]?.batch?.name;
                    row[expiryDateKey] = productMove?.fromBatches[i]?.batch?.expiryDate;
                    row[inventoryKey] = productMove?.fromBatches[i]?.quantity;
                }
                worksheet.addRow(row);
            }
        });
        const filePath = path.join(__dirname, `move_store_${storeId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, `Danhsachchitietchuyenhang.xlsx`, (err) => {
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
