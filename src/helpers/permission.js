export const modelPermissions = [
  {
    name: "home",
    text: "Trang chủ"
  },
  {
    name: "sale",
    text: "Khuyến mãi"
  },
  {
    name: "list_product",
    text: "Danh sách sản phẩm"
  },
  {
    name: "import_product",
    text: "Thêm sản phẩm"
  },
  {
    name: "return_product",
    text: "Trả sản phẩm"
  },
  {
    name: "check_inventory",
    text: "Kiểm tra tồn kho"
  },
  {
    name: "price_setting",
    text: "Cài đặt giá"
  },
  {
    name: "market_common",
    text: "Chợ chung"
  },
  {
    name: "market_store",
    text: "Chợ cửa hàng"
  },
  {
    name: "market_setting",
    text: "Cài đặt chợ"
  },
  {
    name: "medicine_category",
    text: "Danh mục thuốc"
  },
  {
    name: "bill",
    text: "Đơn giá"
  },
  {
    name: "order",
    text: "Đơn hàng",
  },
  {
    name: "return",
    text: "Trả hàng",
  },
  {
    name: "delivery",
    text: "Vận chuyển"
  },
  {
    name: "customer",
    text: "Khách hàng",
  },
  {
    name: "group_customer",
    text: "Nhóm khách hàng",
  },
  {
    name: "provider",
    text: "Nhà cung cấp"
  },
  {
    name: "group_provider",
    text: "Nhóm nhà cung cấp"
  },
  {
    name: "doctor",
    text: "Bác sĩ",
  },
  {
    name: "cashbook",
    text: "Sổ quỹ",
  },
  {
    name: "customer_report",
    text: "Báo cáo khách hàng"
  },
  {
    name: "provider_report",
    text: "Báo cáo nhà cung cấp"
  },
  {
    name: "employee_report",
    text: "Báo cáo nhân viên"
  },
  {
    name: "sale_report",
    text: "Báo cáo bán hàng"
  },
  {
    name: "product_report",
    text: "Báo cáo sản phẩm"
  },
  {
    name: "store",
    text: "Cửa hàng",
  },
  {
    name: "branch",
    text: "Chi nhánh",
  },
  {
    name: "employee",
    text: "Nhân viên"
  },
  {
    name: "role",
    text: "Nhóm quyền",
  },
  {
    name: "discount",
    text: "Phần trăm chiết khấu",
  },
  {
    name: "point_setting",
    text: "Cấu hình điểm"
  },
  {
    name: "connect_system",
    text: "Kết nối hệ thống"
  },
  {
    name: "delivery_fee",
    text: "Phí giao hàng"
  },
  {
    name: "connect_delivery",
    text: "Kết nối giao hàng"
  },
  {
    name: "map",
    text: "Tạo chuyến đi"
  },
  {
    name: "market_config",
    text: "Cấu hình sản phẩm lên chợ"
  },
  {
    name: "market_buy",
    text: "Mua hàng trên chợ"
  },
  {
    name: "market_agency",
    text: "Chợ đại lý"
  },
  {
    name: "market_order",
    text: "Duyệt đơn hàng"
  },
  {
    name: "market_confirm",
    text: "Xác nhận đơn hàng"
  },
  {
    name:"market_agency",
    text: "Duyệt làm đại lý"
  }
];

export const actionPermissions = [
  {
    name: "read",
    text: "Truy cập",
  },
  {
    name: "create",
    text: "Thêm",
  },
  {
    name: "update",
    text: "Sửa",
  },
  {
    name: "delete",
    text: "Xóa",
  },
  {
    name: "download",
    text: "Download/Upload",
  },
  {
    name: "view_all",
    text: "Xem tất cả",
  }
];

export function getPermissionByAction(action) {
  return models
    .filter((m) => m.permissions.includes(action))
    .map((model) => `${action}-${model.name}`);
}
