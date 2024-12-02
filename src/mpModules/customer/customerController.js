import {readDefaultCustomer} from "./customerService";
import {indexOrderDebt} from "./CustomerDebtService";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

const uploadFile = require('../../helpers/upload')
const _ = require("lodash");
const xlsx = require('xlsx');
const moment = require("moment");
const {
    respondWithError,
    respondItemSuccess,
} = require("../../helpers/response");
const {
    updateCustomer,
    createCustomer,
    indexCustomers,
    deleteCustomerById,
    updatePassword,
    indexCustomersByGroup,
    readCustomer,
    updateCustomerStatus,
    indexPaymentCustomer,
    historyPointService,
    historyVisitedService,
    uploadFileCreateCustomer,
    uploadFileCreateCustomerKiotVietService,
    deleteListCustomer
} = require("./customerService");
const {hashPassword} = require("../auth/authService");
const {formatMobileToSave} = require("../../helpers/utils");
const {HttpStatusCode} = require("../../helpers/errorCodes");
const {customerStatus} = require("./customerConstant");

export async function indexCustomersController(req, res) {
    try {
        const {loginUser = {}} = req;
        const result = await indexCustomers({
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

export async function getTotalDebtController(req, res) {
    try {
        const {loginUser = {}} = req;
        const {id} = req.params;
        const result = await indexOrderDebt({
            ...req.query,
            storeId: loginUser.storeId,
            customerId: id
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function getDefaultCustomer(req, res) {
    try {
        const {loginUser = {}} = req;
        const result = await readDefaultCustomer(loginUser.storeId);
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
        const {id} = req.params;
        const {loginUser = {}} = req;
        const result = await readCustomer(id, loginUser);
        if (result.success)
            res.json(respondItemSuccess(result.data, result.message));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function createController(req, res) {
    try {
        const {loginUser = {}} = req;
        const customer = {
            fullName: _.get(req, "body.fullName", ""),
            birthday: _.get(req, "body.birthday", moment().format("YYYY-MM-DD")),
            gender: _.get(req, "body.gender", ""),
            phone: formatMobileToSave(_.get(req, "body.phone", "")),
            email: _.get(req, "body.email", ""),
            facebook:_.get(req,"body.facebook",""),
            taxCode: _.get(req, "body.taxCode", ""),
            address: _.get(req, "body.address", ""),
            position: _.get(req, "body.position", null),
            avatarId: _.get(req, "body.avatarId", null),
            groupCustomerId: _.get(req, "body.groupCustomerId", null),
            type: _.get(req.body, "type", null),
            status: _.get(req.body, "status", customerStatus.ACTIVE),
            wardId: _.get(req.body, "wardId", null),
            districtId: _.get(req.body, "districtId", null),
            provinceId: _.get(req.body, "provinceId", null),
            password: hashPassword(_.get(req, "body.password", "")),
            storeId: loginUser.storeId,
            createdBy: loginUser.id,
            createdAt: new Date(),
            note: _.get(req.body, "note", ""),
            lat:_.get(req.body, "lat", "")?_.get(req.body, "lat", "").trim():null,
            lng:_.get(req.body, "lng", "")?_.get(req.body, "lng", "").trim():null,
            companyName: _.get(req, "body.companyName", null),
            branchId: _.get(req, "body.branchId", null)
        };
        const result = await createCustomer(customer, loginUser);
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
        console.log(req)
        const {id} = req.params;
        const {loginUser = {}} = req;
        const status = _.get(req.body, "status", null);
        const customer = {
            fullName: _.get(req, "body.fullName", ""),
            birthday: _.get(req, "body.birthday", moment().format("YYYY-MM-DD")),
            gender: _.get(req, "body.gender", ""),
            email: _.get(req, "body.email", ""),
            facebook: _.get(req, "body.facebook",""),
            phone: _.get(req,"body.phone",""),
            taxCode: _.get(req, "body.taxCode", ""),
            type: _.get(req.body, "type", null),
            address: _.get(req, "body.address", ""),
            position: _.get(req, "body.position", null),
            avatarId: _.get(req, "body.avatarId", null),
            groupCustomerId: _.get(req, "body.groupCustomerId", null),
            password: hashPassword(_.get(req, "body.password", "")),
            wardId: _.get(req.body, "wardId", null),
            districtId: _.get(req.body, "districtId", null),
            provinceId: _.get(req.body, "provinceId", null),
            note: _.get(req.body, "note", null),
            lat: _.get(req.body, "lat", ""),
            lng: _.get(req.body, "lng", ""),
            storeId: loginUser.storeId,
            ...(status && {status}),
            updatedBy: loginUser.id,
            updatedAt: new Date(),
            companyName: _.get(req, "body.companyName", null),
            branchId: _.get(req, "body.branchId", null)
        };
        const result = await updateCustomer(id, customer, loginUser);
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function deleteController(req, res) {
    try {
        const {id} = req.params;
        const {loginUser = {}} = req;
        const result = await deleteCustomerById(id, loginUser);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function resetPassword(req, res) {
    try {
        const {loginUser = {}} = req;
        const {customerId, newPassword} = req.body;
        const result = await updatePassword(customerId, newPassword, loginUser);
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
        const {id} = req.params;
        const {loginUser = {}} = req;
        const user = {
            status: _.get(req, "body.status", ""),
            updatedBy: loginUser.id,
        };
        const result = await updateCustomerStatus(id, user);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function getCustomerListByGroup(req, res) {
    try {
        const result = await indexCustomersByGroup(req.query);
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function readPaymentCustomerController(req, res) {
    try {
        const {id: customerId} = req.params;
        const result = await indexPaymentCustomer({...req.query, customerId});
        if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function historyPoint(req, res) {
    try {
        const customerId = req.params.customerId;
        const query = req.query;
        const result = await historyPointService(customerId, query);
        if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function historyVisited(req, res) {
    try {
        const customerId = req.params.id;
        const query = req.query;
        const result = await historyVisitedService(customerId, query);
        if (result.success) res.json(respondItemSuccess(_.get(result, "data", {})));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function createCustomerByUploadController(req, res) {
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

        const result = await uploadFileCreateCustomer(data, loginUser);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function exportCustomerController(req, res) {
    try {
        const {loginUser = {}} = req;
        const {page, limit} = req.query;
        const storeId = loginUser.storeId;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = loginUser.name;
        const worksheet = workbook.addWorksheet(`Danh sách khách hàng cửa hàng ${storeId}`);
        worksheet.columns = [
            {header: "Họ tên", key: "name", width: 25},
            {header: "Số điện thoại", key: "phone", width: 15},
            {header: "Mã khách hàng", key: "code", width: 15},
            {header: "Email", key: "email", width: 25},
            {header: "Facebook",key: "facebook",width:25},
            {header: "Giới tính", key: "gender", width: 10},
            {header: "Ngày sinh", key: "birthday", width: 20},
            {header: "Mã thuế", key: "taxCode", width: 20},
            {header: "Nhóm khách hàng", key: "groupCustomerName", width: 25},
            {header: "Xã", key: "wardName", width: 15},
            {header: "Huyện", key: "districtName", width: 15},
            {header: "Tỉnh", key: "provinceName", width: 15},
            {header: "Địa chỉ", key: "address", width: 25},
            {header: "Ghi chú", key: "note", width: 30},
            {header: "Loại khách hàng", key: "type", width: 15},
            {header: "Trạng thái", key: "status", width: 10},
            {header: "Tọa độ", key: "location", width: 40},
            {header: "Điểm tích lũy", key: "point", width: 10},
            {header: "Nợ", key: "debt", width: 10},
        ];
        const result = await indexCustomers({storeId, page, limit : 10**10});
        result.data.items.forEach(item => {
            let location = ""
            if(item.lat && item.lat !== ""){
                location += item.lat + ", ";
            }
            if(item.lng && item.lng !== ""){
                location += item.lng;
            }
            if(item.type === 1){
                item.type = "Khách hàng thường";
            }else if(item.type === 2){
                item.type = "Công ty";
            }else if(item.type === 3){
                item.type = "Nhà thuốc"
            }else if(item.type === 4){
                item.type = "Phòng khám"
            }else{
                item.type = "Đại lý"
            }
            let listGroupCustomerName = item?.listGroupCustomer?.length > 0 ?
                item.listGroupCustomer.map(item=>item?.groupCustomer?.name || "") : [];
            worksheet.addRow({
                name: item.fullName,
                phone: item.phone,
                code: item.code,
                email: item.email,
                facebook:item.facebook,
                gender: item.gender == "female" ? item.gender = 'Nữ' :
                    (item.gender == "male" ? item.gender = 'Nam' : item.gender = 'Khác'),
                birthday: item.birthday,
                taxCode: item.taxCode,
                groupCustomerName: listGroupCustomerName.join("|"),
                wardName: item?.ward?.name2,
                districtName: item?.district?.name2,
                provinceName: item?.province?.name,
                address: item?.address,
                note: item?.note,
                type: item.type,
                status: item?.status == "draft" ? item.status = 2 :
                    (item?.status == "inactive" ? item.status = 0 : item.status = 1),
                location,
                point: item?.point,
                debt: item?.dataValues.totalDebt
            });
        });
        const filePath = path.join(__dirname, `customer_store_${storeId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        res.download(filePath, `Danhsachkhachhang.xlsx`, (err) => {
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

export async function exportCustomerExampleController(req,res){
    try {
        const type = req.query.type || "";
        const tmp = path.resolve(__dirname, '../../../')
        const filePath = path.join(tmp, 'excel', `customer${type}.xlsx`);
        // Sử dụng res.download để gửi file và xóa file sau khi gửi
        res.download(filePath, `Maufilekhachang.xlsx`, (err) => {
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

export async function createCustomerByUploadKiotvietController(req, res) {
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

        const result = await uploadFileCreateCustomerKiotVietService(data, loginUser);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}

export async function deleteListCustomerController(req, res) {
    try {
        const {loginUser = {}} = req;
        const {listCustomerId} = req.body;
        const result = await deleteListCustomer(loginUser,listCustomerId);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        );
    }
}