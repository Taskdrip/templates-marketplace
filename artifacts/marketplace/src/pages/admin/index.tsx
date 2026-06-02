import { Switch, Route } from "wouter";
import AdminLayout from "@/components/layout/AdminLayout";

import AdminOverview from "./Overview";
import AdminProducts from "./Products";
import AdminOrders from "./Orders";
import AdminUsers from "./Users";
import AdminPayments from "./Payments";
import AdminWallets from "./Wallets";
import AdminMessages from "./Messages";
import AdminTickets from "./Tickets";
import AdminRevenue from "./Revenue";
import AdminSettings from "./Settings";
import AdminBlog from "./Blog";
import AdminPushNotifications from "./PushNotifications";

export default function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={AdminOverview} />
        <Route path="/products" component={AdminProducts} />
        <Route path="/orders" component={AdminOrders} />
        <Route path="/users" component={AdminUsers} />
        <Route path="/payments" component={AdminPayments} />
        <Route path="/wallets" component={AdminWallets} />
        <Route path="/messages" component={AdminMessages} />
        <Route path="/tickets" component={AdminTickets} />
        <Route path="/revenue" component={AdminRevenue} />
        <Route path="/settings" component={AdminSettings} />
        <Route path="/blog" component={AdminBlog} />
        <Route path="/push" component={AdminPushNotifications} />
      </Switch>
    </AdminLayout>
  );
}
