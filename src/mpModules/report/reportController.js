import {indexSalesReport} from "./revenueReportService";
import {indexProductsReport} from "./productReportService";

const {
  respondItemSuccess,
  respondWithError,
} = require("../../helpers/response");
const { indexChartProductsReport } = require("./chartReportService");
const { indexRevenuesReport } = require("./revenueReportService");
const { HttpStatusCode } = require("../../helpers/errorCodes");

export async function getChartProductsReport(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexChartProductsReport(req.query, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.BAD_REQUEST, error.message, error)
    );
  }
}

export async function getRevenuesReport(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexRevenuesReport(req.query, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
      respondWithError(HttpStatusCode.BAD_REQUEST, error.message, error)
    );
  }
}

export async function getSalesReport(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexSalesReport(req.query, loginUser.storeId);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
        respondWithError(HttpStatusCode.BAD_REQUEST, error.message, error)
    );
  }
}

export async function getProductsReport(req, res) {
  try {
    const { loginUser = {} } = req;
    const result = await indexProductsReport(req.query, loginUser);
    if (result.success) res.json(respondItemSuccess(result.data));
    else res.json(respondWithError(result.code, result.message, {}));
  } catch (error) {
    res.json(
        respondWithError(HttpStatusCode.BAD_REQUEST, error.message, error)
    );
  }
}
