import { Switch, Route } from "wouter";
import DashboardLayout from "@/components/layout/DashboardLayout";

import Overview from "./Overview";
import Orders from "./Orders";
import OrderDetail from "./OrderDetail";
import Downloads from "./Downloads";
import WalletPage from "./Wallet";
import Messages from "./Messages";
import Notifications from "./Notifications";
import Wishlist from "./Wishlist";
import Tickets from "./Tickets";
import Profile from "./Profile";
import SellerProducts from "@/pages/seller/Products";
import SellerAddProduct from "@/pages/seller/AddProduct";
import SellerEarnings from "@/pages/seller/Earnings";

export default function DashboardRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route path="/orders" component={Orders} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/messages" component={Messages} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/tickets" component={Tickets} />
        <Route path="/profile" component={Profile} />
        <Route path="/products/new" component={SellerAddProduct} />
        <Route path="/products" component={SellerProducts} />
        <Route path="/earnings" component={SellerEarnings} />
      </Switch>
    </DashboardLayout>
  );
}
