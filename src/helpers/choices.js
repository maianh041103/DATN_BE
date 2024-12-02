export const actionTypes = {
    READ: 'read',
    UPDATE: 'update',
    CREATE: 'create',
    DELETE: 'delete',
};

export const objectTypes = {
    PRODUCT: 'product',
    CARD: 'card',
    WISHLIST: 'wishlist',
}

export const accountTypes = {
    CUSTOMER: 1,
    USER: 2,
}

export const userStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
};

export const productType = {
    PRODUCT: 'product',
    COMBO: 'combo'
};

export const productFolderStatus = {
    ACTIVE: 1,
    INACTIVE: 0,
}

export const bannerType = {
    home: 'trang-chu',
    medicine: 'thuoc',
}

export const priorityOptions = [
    {
        value: 0,
        text: 'Không ưu tiên'
    },
    {
        value: 1,
        text: 'Ưu tiên'
    },
]

export const typeOptions = [
    {
        value: 'trang-chu',
        text: 'Trang chủ'
    },
    {
        value: 'thuoc',
        text: 'Thuốc'
    },
    {
        value: 'thuc-pham-chuc-nang',
        text: 'Thực phẩm chức năng'
    },
    {
        value: 'my-pham',
        text: 'Mỹ phẩm'
    },
    {
        value: 'thiet-bi-y-te',
        text: 'Thiết bị y tế'
    },
    {
        value: 'san-pham-khac',
        text: 'Sản phẩm khác'
    }
]

export const PRIORITIZE = 1;
export const NOT_PRIORITIZE = 0;
export const ACTIVE = 1;
export const NOT_ACTIVE = 0;
export const DELETE = 1;
export const NOT_DELETE = 0;
export const READED = 1;
export const PAGE_LIMIT = 10000;
export const YES = 1;
export const NO = 0;
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const MP_KEY_SITE_INTRODUCTION = 'MP_KEY_SITE_INTRODUCTION_';
export const MP_KEY_SITE_INTRODUCTION_PUBLIC = 'MP_KEY_SITE_INTRODUCTION_PUBLIC';
export const MP_KEY_SITE_PAYMENT_INTRODUCTION = 'MP_KEY_SITE_PAYMENT_INTRODUCTION';
export const MP_KEY_SITE_PAYMENT_PUBLIC = 'MP_KEY_SITE_PAYMENT_PUBLIC';
export const MP_KEY_SITE_REGULAR_INTRODUCTION = 'MP_KEY_SITE_REGULAR_INTRODUCTION';
export const MP_KEY_SITE_PRIVACY_POLICY_INTRODUCTION = 'MP_KEY_SITE_PRIVACY_POLICY_INTRODUCTION';
export const MP_KEY_SITE_SHIPPING_METHOD_INTRODUCTION = 'MP_KEY_SITE_SHIPPING_METHOD_INTRODUCTION';
export const MP_KEY_PRODUCT_CATEGORY_LIST = 'MP_KEY_PRODUCT_CATEGORY_LIST';
export const MP_KEY_PRODUCT_FOLDER_LIST = 'MP_KEY_PRODUCT_FOLDER_LIST';

// action
export const logActions = {
    nps_create: {
        value: 'nps_create',
        text: 'Tạo kết nối dược quốc gia',
    },
    nps_read: {
        value: 'nps_read',
        text: 'Xem kết nối dược quốc gia',
    },
    nps_update: {
        value: 'nps_update',
        text: 'Cập nhật kết nối dược quốc gia',
    },
    nps_delete: {
        value: 'nps_delete',
        text: 'Xóa kết nối dược quốc gia',
    },
    purchase_return_create: {
        value: 'purchase_return_create',
        text: 'Tạo phiếu trả sản phẩm',
    },
    purchase_return_read: {
        value: 'purchase_return_read',
        text: 'Xem phiếu trả sản phẩm',
    },
    purchase_return_update: {
        value: 'purchase_return_update',
        text: 'Cập nhật phiếu trả sản phẩm',
    },
    purchase_return_delete: {
        value: 'purchase_return_delete',
        text: 'Xóa phiếu trả sản phẩm',
    },
    inbound_create: {
        value: 'inbound_create',
        text: 'Tạo phiếu nhập sản phẩm',
    },
    inbound_read: {
        value: 'inbound_read',
        text: 'Xem phiếu nhập sản phẩm',
    },
    inbound_update: {
        value: 'inbound_update',
        text: 'Cập nhật phiếu nhập sản phẩm',
    },
    inbound_delete: {
        value: 'inbound_delete',
        text: 'Xóa phiếu nhập sản phẩm',
    },
    product_unit_create: {
        value: 'product_unit_create',
        text: 'Tạo giá đơn vị sản phẩm',
    },
    product_unit_read: {
        value: 'product_unit_read',
        text: 'Xem giá đơn vị sản phẩm',
    },
    product_unit_update: {
        value: 'product_unit_update',
        text: 'Cập nhật giá đơn vị sản phẩm',
    },
    product_unit_delete: {
        value: 'product_unit_delete',
        text: 'Xóa giá đơn vị sản phẩm',
    },
    batch_create: {
        value: 'batch_create',
        text: 'Tạo lô',
    },
    batch_read: {
        value: 'batch_read',
        text: 'Xem lô',
    },
    batch_update: {
        value: 'batch_update',
        text: 'Cập nhật lô',
    },
    batch_delete: {
        value: 'batch_delete',
        text: 'Xóa lô',
    },
    health_facility_create: {
        value: 'health_facility_create',
        text: 'Tạo cơ sở khám bệnh',
    },
    health_facility_read: {
        value: 'health_facility_read',
        text: 'Xem cơ sở khám bệnh',
    },
    health_facility_update: {
        value: 'health_facility_update',
        text: 'Cập nhật cơ sở khám bệnh',
    },
    health_facility_delete: {
        value: 'health_facility_delete',
        text: 'Xóa cơ sở khám bệnh',
    },
    prescription_create: {
        value: 'prescription_create',
        text: 'Tạo đơn thuốc',
    },
    prescription_read: {
        value: 'prescription_read',
        text: 'Xem đơn thuốc',
    },
    prescription_update: {
        value: 'prescription_update',
        text: 'Cập nhật đơn thuốc',
    },
    prescription_delete: {
        value: 'prescription_delete',
        text: 'Xóa đơn thuốc',
    },
    doctor_create: {
        value: 'doctor_create',
        text: 'Tạo bác sĩ',
    },
    doctor_read: {
        value: 'doctor_read',
        text: 'Xem bác sĩ',
    },
    doctor_update: {
        value: 'doctor_update',
        text: 'Cập nhật bác sĩ',
    },
    doctor_delete: {
        value: 'doctor_delete',
        text: 'Xóa bác sĩ',
    },
    work_place_create: {
        value: 'work_place_create',
        text: 'Tạo nơi công tác',
    },
    work_place_read: {
        value: 'work_place_read',
        text: 'Xem nơi công tác',
    },
    work_place_update: {
        value: 'work_place_update',
        text: 'Cập nhật nơi công tác',
    },
    work_place_delete: {
        value: 'work_place_delete',
        text: 'Xóa nơi công tác',
    },
    // level 
    level_create: {
        value: 'level_create',
        text: 'Tạo trình độ',
    },
    level_read: {
        value: 'level_read',
        text: 'Xem trình độ',
    },
    level_update: {
        value: 'level_update',
        text: 'Cập nhật trình độ',
    },
    level_delete: {
        value: 'level_delete',
        text: 'Xóa trình độ',
    },
    // specialist 
    specialist_create: {
        value: 'specialist_create',
        text: 'Tạo chuyên khoa',
    },
    specialist_read: {
        value: 'specialist_read',
        text: 'Xem chuyên khoa',
    },
    specialist_update: {
        value: 'specialist_update',
        text: 'Cập nhật chuyên khoa',
    },
    specialist_delete: {
        value: 'specialist_delete',
        text: 'Xóa chuyên khoa',
    },
    // supplier 
    supplier_create: {
        value: 'supplier_create',
        text: 'Tạo nhà cung cấp',
    },
    supplier_read: {
        value: 'supplier_read',
        text: 'Xem nhà cung cấp',
    },
    supplier_update: {
        value: 'supplier_update',
        text: 'Cập nhật nhà cung cấp',
    },
    supplier_delete: {
        value: 'supplier_delete',
        text: 'Xóa nhà cung cấp',
    },
    // store 
    store_create: {
        value: 'store_create',
        text: 'Tạo cửa hàng',
    },
    store_read: {
        value: 'store_read',
        text: 'Xem cửa hàng',
    },
    store_update: {
        value: 'store_update',
        text: 'Cập nhật cửa hàng',
    },
    store_delete: {
        value: 'store_delete',
        text: 'Xóa cửa hàng',
    },
    // branch 
    branch_create: {
        value: 'branch_create',
        text: 'Tạo chi nhánh cửa hàng',
    },
    branch_read: {
        value: 'branch_read',
        text: 'Xem chi nhánh cửa hàng',
    },
    branch_update: {
        value: 'branch_update',
        text: 'Cập nhật chi nhánh cửa hàng',
    },
    branch_delete: {
        value: 'branch_delete',
        text: 'Xóa chi nhánh cửa hàng',
    },
    // address 
    address_create: {
        value: 'address_create',
        text: 'Tạo cửa hàng',
    },
    address_read: {
        value: 'address_read',
        text: 'Xem địa chỉ',
    },
    address_update: {
        value: 'address_update',
        text: 'Cập nhật địa chỉ',
    },
    address_delete: {
        value: 'address_delete',
        text: 'Xóa địa chỉ',
    },
    // auth 
    auth_create: {
        value: 'auth_create',
        text: 'Tạo tài khoản',
    },
    auth_read: {
        value: 'auth_read',
        text: 'Xem tài khoản',
    },
    auth_update: {
        value: 'auth_update',
        text: 'Cập nhật tài khoản',
    },
    auth_delete: {
        value: 'auth_delete',
        text: 'Xóa tài khoản',
    },
    // banner 
    banner_create: {
        value: 'banner_create',
        text: 'Tạo banner',
    },
    banner_read: {
        value: 'banner_read',
        text: 'Xem banner',
    },
    banner_update: {
        value: 'banner_update',
        text: 'Cập nhật banner',
    },
    banner_delete: {
        value: 'banner_delete',
        text: 'Xóa banner',
    },
    // config 
    config_create: {
        value: 'config_create',
        text: 'Tạo cấu hình',
    },
    config_read: {
        value: 'config_read',
        text: 'Xem cấu hình',
    },
    config_update: {
        value: 'config_update',
        text: 'Cập nhật cấu hình',
    },
    config_delete: {
        value: 'config_delete',
        text: 'Xóa cấu hình',
    },
    // contact_work 
    contact_work_create: {
        value: 'contact_work_create',
        text: 'Tạo liên hệ',
    },
    contact_work_read: {
        value: 'contact_work_read',
        text: 'Xem liên hệ',
    },
    contact_work_update: {
        value: 'contact_work_update',
        text: 'Cập nhật liên hệ',
    },
    contact_work_delete: {
        value: 'contact_work_delete',
        text: 'Xóa liên hệ',
    },
    // partner 
    partner_create: {
        value: 'partner_create',
        text: 'Tạo đối tác',
    },
    partner_read: {
        value: 'partner_read',
        text: 'Xem đối tác',
    },
    partner_update: {
        value: 'partner_update',
        text: 'Cập nhật đối tác',
    },
    partner_delete: {
        value: 'partner_delete',
        text: 'Xóa đối tác',
    },
    // customer 
    customer_create: {
        value: 'customer_create',
        text: 'Tạo khách hàng',
    },
    customer_read: {
        value: 'customer_read',
        text: 'Xem khách hàng',
    },
    customer_update: {
        value: 'customer_update',
        text: 'Cập nhật khách hàng',
    },
    customer_update_password: {
        value: 'customer_update_password',
        text: 'Cập nhật mật khẩu khách hàng',
    },
    customer_delete: {
        value: 'customer_delete',
        text: 'Xóa khách hàng',
    },
    group_supplier_create: {
        value: 'group_supplier_create',
        text: 'Tạo nhóm nhà cung cấp',
    },
    group_supplier_read: {
        value: 'group_supplier_read',
        text: 'Xem nhóm nhà cung cấp',
    },
    group_supplier_update: {
        value: 'group_supplier_update',
        text: 'Cập nhật nhóm nhà cung cấp',
    },
    group_supplier_delete: {
        value: 'group_supplier_delete',
        text: 'Xóa nhóm nhà cung cấp',
    },
    group_product_create: {
        value: 'group_product_create',
        text: 'Tạo nhóm sản phẩm',
    },
    group_product_read: {
        value: 'group_product_read',
        text: 'Xem nhóm sản phẩm',
    },
    group_product_update: {
        value: 'group_product_update',
        text: 'Cập nhật nhóm sản phẩm',
    },
    group_product_delete: {
        value: 'group_product_delete',
        text: 'Xóa nhóm sản phẩm',
    },
    // group_customer 
    group_customer_create: {
        value: 'group_customer_create',
        text: 'Tạo nhóm khách hàng',
    },
    group_customer_read: {
        value: 'group_customer_read',
        text: 'Xem nhóm khách hàng',
    },
    group_customer_update: {
        value: 'group_customer_update',
        text: 'Cập nhật nhóm khách hàng',
    },
    group_customer_delete: {
        value: 'group_customer_delete',
        text: 'Xóa nhóm khách hàng',
    },
    // department_type 
    department_type_create: {
        value: 'department_type_create',
        text: 'Tạo loại nhóm khách hàng',
    },
    department_type_read: {
        value: 'department_type_read',
        text: 'Xem loại nhóm khách hàng',
    },
    department_type_update: {
        value: 'department_type_update',
        text: 'Cập nhật loại nhóm khách hàng',
    },
    department_type_delete: {
        value: 'department_type_delete',
        text: 'Xóa loại nhóm khách hàng',
    },
    // discount_program
    discount_program_create: {
        value: 'discount_program_create',
        text: 'Tạo chiết khấu',
    },
    discount_program_read: {
        value: 'discount_program_read',
        text: 'Xem chiết khấu',
    },
    discount_program_update: {
        value: 'discount_program_update',
        text: 'Cập nhật chiết khấu',
    },
    discount_program_delete: {
        value: 'discount_program_delete',
        text: 'Xóa chiết khấu',
    },
    // evaluation
    evaluation_create: {
        value: 'evaluation_create',
        text: 'Tạo cảm nhận khách hàng',
    },
    evaluation_read: {
        value: 'evaluation_read',
        text: 'Xem cảm nhận khách hàng',
    },
    evaluation_update: {
        value: 'evaluation_update',
        text: 'Cập nhật cảm nhận khách hàng',
    },
    evaluation_delete: {
        value: 'evaluation_delete',
        text: 'Xóa cảm nhận khách hàng',
    },
    // icon
    icon_create: {
        value: 'icon_create',
        text: 'Tạo icon',
    },
    icon_read: {
        value: 'icon_read',
        text: 'Xem icon',
    },
    icon_update: {
        value: 'icon_update',
        text: 'Cập nhật icon',
    },
    icon_delete: {
        value: 'icon_delete',
        text: 'Xóa icon',
    },
    // manufacture
    manufacture_create: {
        value: 'manufacture_create',
        text: 'Tạo nhà sản xuất',
    },
    manufacture_read: {
        value: 'manufacture_read',
        text: 'Xem nhà sản xuất',
    },
    manufacture_update: {
        value: 'manufacture_update',
        text: 'Cập nhật nhà sản xuất',
    },
    manufacture_delete: {
        value: 'manufacture_delete',
        text: 'Xóa nhà sản xuất',
    },
    // notification
    notification_create: {
        value: 'notification_create',
        text: 'Tạo thông báo',
    },
    notification_read: {
        value: 'notification_read',
        text: 'Xem thông báo',
    },
    notification_update: {
        value: 'notification_update',
        text: 'Cập nhật thông báo',
    },
    notification_delete: {
        value: 'notification_delete',
        text: 'Xóa thông báo',
    },
    // order 
    order_create: {
        value: 'order_create',
        text: 'Tạo đơn hàng',
    },
    order_read: {
        value: 'order_read',
        text: 'Xem đơn hàng',
    },
    order_update: {
        value: 'order_update',
        text: 'Cập nhật đơn hàng',
    },
    order_delete: {
        value: 'order_delete',
        text: 'Xóa đơn hàng',
    },
    // sample prescription
    sample_prescription_create: {
        value: 'sample_prescription_create',
        text: 'Tạo đơn thuôc mẫu',
    },
    sample_prescription_read: {
        value: 'sample_prescription_read',
        text: 'Xem đơn thuôc mẫu',
    },
    sample_prescription_update: {
        value: 'sample_prescription_update',
        text: 'Cập nhật đơn thuôc mẫu',
    },
    sample_prescription_delete: {
        value: 'sample_prescription_delete',
        text: 'Xóa đơn thuôc mẫu',
    },
    // product folder 
    product_folder_create: {
        value: 'product_folder_create',
        text: 'Tạo loại sản phẩm',
    },
    product_folder_read: {
        value: 'product_folder_read',
        text: 'Xem loại sản phẩm',
    },
    product_folder_update: {
        value: 'product_folder_update',
        text: 'Cập nhật loại sản phẩm',
    },
    product_folder_delete: {
        value: 'product_folder_delete',
        text: 'Xóa loại sản phẩm',
    },
    // product
    product_search: {
        value: 'product_search',
        text: 'Tìm kiếm sản phẩm',
    },
    product_create: {
        value: 'product_create',
        text: 'Tạo sản phẩm',
    },
    product_read: {
        value: 'product_read',
        text: 'Xem sản phẩm',
    },
    product_update: {
        value: 'product_update',
        text: 'Cập nhật sản phẩm',
    },
    product_delete: {
        value: 'product_delete',
        text: 'Xóa sản phẩm',
    },
    // promotion_program
    promotion_program_create: {
        value: 'promotion_program_create',
        text: 'Tạo chương trình khuyến mại',
    },
    promotion_program_read: {
        value: 'promotion_program_read',
        text: 'Xem chương trình khuyến mại',
    },
    promotion_program_update: {
        value: 'promotion_program_update',
        text: 'Cập nhật chương trình khuyến mại',
    },
    promotion_program_delete: {
        value: 'promotion_program_delete',
        text: 'Xóa chương trình khuyến mại',
    },
    // role
    role_create: {
        value: 'role_create',
        text: 'Tạo quyền',
    },
    role_read: {
        value: 'role_read',
        text: 'Xem quyền',
    },
    role_update: {
        value: 'role_update',
        text: 'Cập nhật quyền',
    },
    role_delete: {
        value: 'role_delete',
        text: 'Xóa quyền',
    },
    // tag
    tag_create: {
        value: 'tag_create',
        text: 'Tạo thẻ',
    },
    tag_read: {
        value: 'tag_read',
        text: 'Xem thẻ',
    },
    tag_update: {
        value: 'tag_update',
        text: 'Cập nhật thẻ',
    },
    tag_delete: {
        value: 'tag_delete',
        text: 'Xóa thẻ',
    },
    // treatment
    treatment_create: {
        value: 'treatment_create',
        text: 'Tạo nhóm hỗ trợ điều trị',
    },
    treatment_read: {
        value: 'treatment_read',
        text: 'Xem nhóm hỗ trợ điều trị',
    },
    treatment_update: {
        value: 'treatment_update',
        text: 'Cập nhật nhóm hỗ trợ điều trị',
    },
    treatment_delete: {
        value: 'treatment_delete',
        text: 'Xóa nhóm hỗ trợ điều trị',
    },
    // unit
    unit_create: {
        value: 'unit_create',
        text: 'Tạo đơn vị',
    },
    unit_read: {
        value: 'unit_read',
        text: 'Xem đơn vị',
    },
    unit_update: {
        value: 'unit_update',
        text: 'Cập nhật đơn vị',
    },
    unit_delete: {
        value: 'unit_delete',
        text: 'Xóa đơn vị',
    },
    // user
    user_create: {
        value: 'user_create',
        text: 'Tạo người dùng nội bộ',
    },
    user_read: {
        value: 'user_read',
        text: 'Xem người dùng nội bộ',
    },
    user_update: {
        value: 'user_update',
        text: 'Cập nhật người dùng nội bộ',
    },
    user_update_password: {
        value: 'user_update_password',
        text: 'Cập nhật mật khẩu người dùng nội bộ',
    },
    user_delete: {
        value: 'user_delete',
        text: 'Xóa người dùng nội bộ',
    },
    // utility
    utility_create: {
        value: 'utility_create',
        text: 'Tạo nhóm công dụng',
    },
    utility_read: {
        value: 'utility_read',
        text: 'Xem nhóm công dụng',
    },
    utility_update: {
        value: 'utility_update',
        text: 'Cập nhật nhóm công dụng',
    },
    utility_delete: {
        value: 'utility_delete',
        text: 'Xóa nhóm công dụng',
    },
    // pathology
    pathology_create: {
        value: 'pathology_create',
        text: 'Tạo nhóm dược lý',
    },
    pathology_read: {
        value: 'pathology_read',
        text: 'Xem nhóm dược lý',
    },
    pathology_update: {
        value: 'pathology_update',
        text: 'Cập nhật nhóm dược lý',
    },
    pathology_delete: {
        value: 'pathology_delete',
        text: 'Xóa nhóm dược lý',
    },
    // card
    card_create: {
        value: 'card_create',
        text: 'Thêm sản phẩm vào giỏ hàng',
    },
    card_delete: {
        value: 'card_delete',
        text: 'Xóa sản phẩm trong giỏ hàng',
    },
    // wishlist
    wishlist_create: {
        value: 'wishlist_create',
        text: 'Thêm sản phẩm yêu thích',
    },
    wishlist_delete: {
        value: 'wishlist_delete',
        text: 'Xóa sản phẩm yêu thích',
    },
    // position
    position_create: {
        value: 'position_create',
        text: 'Tạo vị trí',
    },
    position_read: {
        value: 'position_read',
        text: 'Xem vị trí',
    },
    position_update: {
        value: 'position_update',
        text: 'Cập nhật vị trí',
    },
    position_delete: {
        value: 'position_delete',
        text: 'Xóa vị trí',
    },
    // dosage
    dosage_create: {
        value: 'dosage_create',
        text: 'Tạo đường thuốc',
    },
    dosage_read: {
        value: 'dosage_read',
        text: 'Xem đường thuốc',
    },
    dosage_update: {
        value: 'dosage_update',
        text: 'Cập nhật đường thuốc',
    },
    dosage_delete: {
        value: 'dosage_delete',
        text: 'Xóa đường thuốc',
    },
    // country-produce
    country_produce_create: {
        value: 'country_produce_create',
        text: 'Tạo nước sản xuất',
    },
    country_produce_read: {
        value: 'country_produce_read',
        text: 'Xem nước sản xuất',
    },
    country_produce_update: {
        value: 'country_produce_update',
        text: 'Cập nhật nước sản xuất',
    },
    country_produce_delete: {
        value: 'country_produce_delete',
        text: 'Xóa nước sản xuất',
    },
}