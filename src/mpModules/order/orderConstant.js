export const orderStatuses = {
  DRAFT: "DRAFT",
  PENDING: "PENDING", // Đang chờ duyệt / Duyệt
  CONFIRMING: "CONFIRMING", // Đang xác nhận / Xác nhận
  SHIPPING: "SHIPPING", // Đang vận chuyển/ Vận chuyển
  DELIVERING: "DELIVERING", // Đang giao hàng/Giao hàng
  PAID: "PAID", // Đã thanh toán
  CANCELLED: "CANCELLED", // Hủy đơn
  SUCCEED: "SUCCEED", // Đơn hàng thành công
};

export const orderStatusOptions = [
  {
    value: 1,
    text: "Đang chờ",
    type: "DANG CHO",
  },
  {
    value: 2,
    text: "Đang chuyển hàng",
    type: "DANG CHUYEN HANG",
  },
  {
    value: 3,
    text: "Đã giao hàng",
    type: "DA GIAO HANG",
  },
  {
    value: 4,
    text: "Đã thanh toán",
    type: "DA THANH TOAN",
  },
  {
    value: 5,
    text: "Đã hủy",
    type: "DA HUY",
  },
  {
    value: 6,
    text: "Thành công",
    type: "HOAN TAT DON HANG",
  },
];

export const paymentTypes = {
  BANK: "BANK",
  COD: "COD",
  CASH: "CASH",
  DEBT: "DEBT",
};

export const discountTypes = {
  PERCENT: 1,
  MONEY: 2,
};

export const orderHistoryStatus = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

export const thresholdPercentDiscount = 0.5;

export const iconNotificationId = 1;
