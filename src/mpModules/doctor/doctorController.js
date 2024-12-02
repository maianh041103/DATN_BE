import ExcelJS from "exceljs";
import models from "../../../database/models";
import path from "path";

const _ = require("lodash");
const {
    respondItemSuccess,
    respondWithError,
} = require("../../helpers/response");
const {
    readDoctor,
    indexDoctors,
    updateDoctor,
    createDoctor,
    deleteDoctor,
    uploadFileCreateDoctor,
    exportDoctorService
} = require("./doctorService");
const {HttpStatusCode} = require("../../helpers/errorCodes");

const fs = require('fs')
const uploadFile = require('../../helpers/upload');
const xlsx = require('xlsx');


export async function indexDoctorsController(req, res) {
    try {
        const {loginUser = {}} = req;
        const result = await indexDoctors({...req.query, storeId: loginUser.storeId});
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

export async function createDoctorController(req, res) {
    try {
        const {loginUser = {}} = req;
        const result = await createDoctor({
            name: _.get(req.body, "name", ""),
            phone: _.get(req.body, "phone", ""),
            code: _.get(req.body, "code", ""),
            email: _.get(req.body, "email", ""),
            gender: _.get(req.body, "gender", ""),
            specialistId: _.get(req.body, "specialistId", null),
            levelId: _.get(req.body, "levelId", null),
            workPlaceId: _.get(req.body, "workPlaceId", null),
            avatarId: _.get(req.body, "avatarId", null),
            wardId: _.get(req.body, "wardId", null),
            districtId: _.get(req.body, "districtId", null),
            provinceId: _.get(req.body, "provinceId", null),
            storeId: loginUser.storeId,
            address: _.get(req.body, "address", ""),
            status: _.get(req.body, "status", null),
            note: _.get(req.body, "note", ""),
            createdBy: _.get(req, "loginUser.id", null),
            createdAt: new Date(),
        });
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

export async function readDoctorController(req, res) {
    try {
        const {id} = req.params;
        const {loginUser = {}} = req;
        const result = await readDoctor(id, loginUser);
        if (result.success) res.json(respondItemSuccess(result.data));
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

export async function updateDoctorController(req, res) {
    try {
        const {id} = req.params;
        const {loginUser = {}} = req;
        const status = _.get(req.body, "status", null);
        const doctor = {
            name: _.get(req.body, "name", ""),
            phone: _.get(req.body, "phone", ""),
            email: _.get(req.body, "email", ""),
            gender: _.get(req.body, "gender", ""),
            specialistId: _.get(req.body, "specialistId", null),
            levelId: _.get(req.body, "levelId", null),
            workPlaceId: _.get(req.body, "workPlaceId", null),
            avatarId: _.get(req.body, "avatarId", null),
            wardId: _.get(req.body, "wardId", null),
            districtId: _.get(req.body, "districtId", null),
            provinceId: _.get(req.body, "provinceId", null),
            storeId: loginUser.storeId,
            address: _.get(req.body, "address", ""),
            status: _.get(req.body, "status", null),
            note: _.get(req.body, "note", ""),
            ...(status !== null && {status}),
            updatedBy: _.get(req, "loginUser.id", null),
            updatedAt: new Date(),
        };
        const result = await updateDoctor(id, doctor, loginUser);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

export async function deleteDoctorController(req, res) {
    try {
        const {id} = req.params;
        const {loginUser = {}} = req;
        const result = await deleteDoctor(id, loginUser);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error));
    }
}

export async function createDoctorByUploadController(req, res) {
    try {
        const {loginUser = {}} = req

        await uploadFile(req, res)

        if (req.file == undefined) {
            return res.status(400).send({message: 'Please upload a file!'})
        }

        // Đường dẫn tạm thời của tệp Excel đã tải lên
        const excelFilePath = req.file.path

        // Đọc dữ liệu từ tệp Excel
        const workbook = xlsx.readFile(excelFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const data = xlsx.utils.sheet_to_json(worksheet)
        const result = await uploadFileCreateDoctor(data, loginUser);
        if (result.success) res.json(respondItemSuccess());
        else res.json(respondWithError(result.code, result.message, {}));
    } catch (error) {
        res.json(
            respondWithError(HttpStatusCode.SYSTEM_ERROR, error.message, error)
        )
    }
}

export async function exportDoctorController(req, res) {
    try {
        const {loginUser = {}} = req;
        const storeId = loginUser.storeId;
        const {page, limit} = req.query;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = loginUser.name;
        const worksheet = workbook.addWorksheet(`Danh sách bác sĩ cửa hàng ${storeId}`);
        worksheet.columns = [
            {header: "Họ tên", key: "name", width: 25},
            {header: "Số điện thoại", key: "phone", width: 15},
            {header: "Mã bác sĩ", key: "code", width: 15},
            {header: "Email", key: "email", width: 25},
            {header: "Giới tính", key: "gender", width: 10},
            {header: "Chuyên khoa", key: "specialistName", width: 20},
            {header: "Trình độ", key: "levelName", width: 20},
            {header: "Nơi công tác", key: "workPlaceName", width: 25},
            {header: "Xã", key: "wardName", width: 15},
            {header: "Huyện", key: "districtName", width: 15},
            {header: "Tỉnh", key: "provinceName", width: 15},
            {header: "Địa chỉ", key: "address", width: 25},
            {header: "Ghi chú", key: "note", width: 30},
            {header: "Trạng thái", key: "status", width: 10}
        ];
        const result = await indexDoctors({storeId, page, limit});
        result.data.items.forEach(item => {
            worksheet.addRow({
                name: item.name,
                phone: item.phone,
                code: item.code,
                email: item.email,
                gender: item.gender == "female" ? item.gender = 0 : (item.gender == "male" ? item.gender = 1 : item.gender = 2),
                specialistName: item?.specialist?.name,
                levelName: item?.level?.name,
                workPlaceName: item?.workPlace?.name,
                wardName: item?.ward?.name2,
                districtName: item?.district?.name2,
                provinceName: item?.province?.name,
                address: item?.address,
                note: item?.note,
                status: item?.status
            });
        });
        const filePath = path.join(__dirname, `doctor_store_${storeId}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        // // Set up the response headers
        // res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        // res.setHeader("Content-Disposition", "attachment; filename=" + `doctor_store_${storeId}.xlsx`);
        //
        // const fileStream = fs.createReadStream(filePath);
        // fileStream.pipe(res);
        //
        // fileStream.on('error', (err) => {
        //   console.log(`Lỗi trong quá trình tải file ${err}`);
        // });
        //
        // fileStream.on("success",()=>{
        //   console.log("Success!");
        // });
        // if (result.success) res.json(respondItemSuccess(result.data));

        // Sử dụng res.download để gửi file và xóa file sau khi gửi
        res.download(filePath, `doctor_store_${storeId}.xlsx`, (err) => {
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

export async function exportDoctorExampleController(req,res){
    try {
        const tmp = path.resolve(__dirname, '../../../');
        const filePath = path.join(tmp, 'excel', 'doctor.xlsx');
        console.log(filePath);
        // Sử dụng res.download để gửi file và xóa file sau khi gửi
        res.download(filePath, `doctorExample.xlsx`, (err) => {
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