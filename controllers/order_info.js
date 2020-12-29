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
    // console.log(req.body, "PAYLOAD PASSED TO THE API");
    const response = await models.OrderInfo.query().insert(body);
    // console.log(response, "RESPONSE");
    return res.status(200).send({ Status: true, insertedData: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: true, error: JSON.stringify(e) });
  }
};

const getOrderInfo = async (req, res, next) => {
  try {
    const { account_id } = req.params;
    const response = await models.OrderInfo.query().where({
      updated_by: account_id,
      ordered: false,
      billed: false,
    });
    // .first();
    return res.status(200).send({ orders: response });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ Status: true, error: JSON.stringify(e) });
  }
};

const orderInfoController = {
  postOrderInfo,
  getOrderInfo,
};

export default orderInfoController;
