import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Mail, Shield, Key } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card/50 border-border/50 text-center">
            <CardContent className="pt-6">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-border/50">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {user?.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{user?.username}</h3>
              <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                {user?.role} Account
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{user ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Purchases</span>
                <span className="font-medium">{user?.totalPurchases || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-emerald-500">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="w-5 h-5 mr-2 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user?.email} className="bg-background/50" />
              </div>
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Update your password and secure your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" className="bg-background/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" className="bg-background/50" />
                </div>
              </div>
              <Button variant="secondary" className="mt-4">Update Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
