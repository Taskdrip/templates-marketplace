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
        <Route path="/dashboard" component={Overview} />
        <Route path="/dashboard/orders/:id" component={OrderDetail} />
        <Route path="/dashboard/orders" component={Orders} />
        <Route path="/dashboard/downloads" component={Downloads} />
        <Route path="/dashboard/wallet" component={WalletPage} />
        <Route path="/dashboard/messages" component={Messages} />
        <Route path="/dashboard/notifications" component={Notifications} />
        <Route path="/dashboard/wishlist" component={Wishlist} />
        <Route path="/dashboard/tickets" component={Tickets} />
        <Route path="/dashboard/profile" component={Profile} />
        <Route path="/seller/products/new" component={SellerAddProduct} />
        <Route path="/seller/products" component={SellerProducts} />
        <Route path="/seller/earnings" component={SellerEarnings} />
      </Switch>
    </DashboardLayout>
  );
}
