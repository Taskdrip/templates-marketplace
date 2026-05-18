import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import walletsRouter from "./wallets";
import reviewsRouter from "./reviews";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import favoritesRouter from "./favorites";
import downloadsRouter from "./downloads";
import ticketsRouter from "./tickets";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(walletsRouter);
router.use(reviewsRouter);
router.use(messagesRouter);
router.use(notificationsRouter);
router.use(favoritesRouter);
router.use(downloadsRouter);
router.use(ticketsRouter);
router.use(adminRouter);

export default router;
