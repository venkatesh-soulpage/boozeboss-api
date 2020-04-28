var express = require('express');
var router = express.Router();
import productsController from '../controllers/products';
import VerifyToken from '../utils/verification'
import VerifyRole from '../utils/verification_role'

/* GET - Update a new product */
router.get(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    productsController.getProducts
);

/* POST - Create a new product */
router.post(
    '/', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    productsController.createProduct
);

/* PUT - Update a product information */
router.put(
    '/:product_id', 
    VerifyToken, 
    VerifyRole(['BRAND'], ['OWNER', 'MANAGER']),
    productsController.updateProduct
);

module.exports = router;