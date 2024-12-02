import {HttpStatusCode} from "./errorCodes";

export function raiseBadRequestError(msg) {
    throw Error(
        JSON.stringify({
            error: true,
            code: HttpStatusCode.BAD_REQUEST,
            message: msg
        })
    );
}