var express = require("express");
var router = express.Router();
import roleController from "../controllers/role";
import statisticsController from "../controllers/statistics";
import VerifyToken from "../utils/verification";
import VerifyRole from "../utils/verification_role";

/* GET - Get a list of client organizations */
router.get("/", statisticsController.getCounInfo);

module.exports = router;
