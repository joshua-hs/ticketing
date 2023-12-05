import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@jhshtickets/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsWrapper } from "../nats-wrapper";
import { stripe } from "../stripe";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    // Find order that user is trying to pay for
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    // Make sure the order belongs to this user
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Make sure order is not yet cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Order has been cancelled");
    }

    const stripeResponse = await stripe.charges.create({
      amount: order.price * 100,
      currency: "usd",
      source: token,
    });

    const payment = Payment.build({ orderId, stripeId: stripeResponse.id });
    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
