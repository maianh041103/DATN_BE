


const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'

const endpointsFiles = [
    './src/mpModules/address/index.js',
    './src/mpModules/auth/index.js',
    './src/mpModules/banner/index.js',
    './src/mpModules/batch/index.js',
    './src/mpModules/behavior/index.js',
    './src/mpModules/branch/index.js',
    './src/mpModules/configuration/index.js',
    './src/mpModules/contactWork/index.js',
    './src/mpModules/countryProduce/index.js',
    './src/mpModules/customer/index.js',
    './src/mpModules/discountProgram/index.js',
    './src/mpModules/doctor/index.js',
    './src/mpModules/dosage/index.js',
    './src/mpModules/groupCustomer/index.js',
    './src/mpModules/groupProduct/index.js',
    './src/mpModules/groupSupplier/index.js',
    './src/mpModules/healthCheck/index.js',
    './src/mpModules/healthFacility/index.js',
    './src/mpModules/image/index.js',
    './src/mpModules/inbound/index.js',
    './src/mpModules/level/index.js',
    './src/mpModules/manufacture/index.js',
    './src/mpModules/medicationCategory/index.js',
    './src/mpModules/nationalPharmacySystem/index.js',
    './src/mpModules/notification/index.js',
    './src/mpModules/order/index.js',
    './src/mpModules/position/index.js',
    './src/mpModules/prescription/index.js',
    './src/mpModules/product/index.js',
    './src/mpModules/productCategory/index.js',
    // './src/mpModules/productStatistic/index.js',
    './src/mpModules/promotionProgram/index.js',
    './src/mpModules/purchaseReturn/index.js',
    './src/mpModules/report/index.js',
    './src/mpModules/role/index.js',
    './src/mpModules/samplePrescription/index.js',
    './src/mpModules/specialist/index.js',
    './src/mpModules/store/index.js',
    './src/mpModules/supplier/index.js',
    './src/mpModules/user/index.js',
    './src/mpModules/workPlace/index.js'
]




swaggerAutogen(outputFile, endpointsFiles)