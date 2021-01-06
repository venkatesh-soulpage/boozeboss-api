import models from "../models";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import queryString from "query-string";

import _ from "lodash";

const postOrderInfo = async (req, res, next) => {
  try {
    const body = req.body.data;
    const usertoken = req.headers.authorization;
    const token = usertoken.split(" ");
    const decoded = jwt.verify(token[1], process.env.SECRET_KEY);
    for (let info of body) {
      info.updated_by = decoded.id;
    }
    const response = await models.OrderInfo.query().insert(body);
<<<<<<< HEAD
    console.log(response, "RESPONSE");
    const IDs = [];
    for (let info of response) {
      IDs.push(info.id);
    }
    console.log(IDs, "IDS FROM INSERTED DATA");
    return res
      .status(200)
      .send({ Status: true, insertedData: response, insertedIds: IDs });
=======
    return res.status(200).send({ Status: true, insertedData: response });
>>>>>>> 15e125a5aeb3e9b01469d0def7f9935d89d704c6
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const getOrderInfo = async (req, res, next) => {
  try {
    const { IDS } = req.body;
    console.log(IDS, "IDS FROM FRONEND");
    const response = await models.OrderInfo.query()
      .withGraphFetched("[ordered_venue_product_id, ordered_event_product_id]")
      .whereIn("id", IDS);
    console.log(response, "RESPONSE FROM API");
    return res.status(200).send({ Status: true, orders: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: false, error: JSON.stringify(e) });
  }
};

const orderInfoController = {
  postOrderInfo,
  getOrderInfo,
};

export default orderInfoController;
