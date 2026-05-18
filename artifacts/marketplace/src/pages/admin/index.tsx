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

export default function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminOverview} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/payments" component={AdminPayments} />
        <Route path="/admin/wallets" component={AdminWallets} />
        <Route path="/admin/messages" component={AdminMessages} />
        <Route path="/admin/tickets" component={AdminTickets} />
        <Route path="/admin/revenue" component={AdminRevenue} />
      </Switch>
    </AdminLayout>
  );
}
