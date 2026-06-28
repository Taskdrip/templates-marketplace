import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile, useChangePassword } from "@/hooks/useMutations";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Key, Wallet, Loader2, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profileForm, setProfileForm] = useState({
    displayName: "",
    phone: "",
    telegramHandle: "",
    avatarUrl: "",
    piWalletAddress: "",
    sellerBio: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName ?? "",
        phone: user.phone ?? "",
        telegramHandle: user.telegramHandle ?? "",
        avatarUrl: user.avatarUrl ?? "",
        piWalletAddress: (user as any).piWalletAddress ?? "",
        sellerBio: (user as any).sellerBio ?? "",
      });
    }
  }, [user]);

  const setProfile = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfileForm(f => ({ ...f, [k]: e.target.value }));

  const setPassword = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordForm(f => ({ ...f, [k]: e.target.value }));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      data: {
        displayName: profileForm.displayName || undefined,
        phone: profileForm.phone || undefined,
        telegramHandle: profileForm.telegramHandle || undefined,
        avatarUrl: profileForm.avatarUrl || undefined,
        piWalletAddress: profileForm.piWalletAddress || undefined,
        sellerBio: profileForm.sellerBio || undefined,
      },
    }, {
      onSuccess: (updatedUser: any) => {
        toast({ title: "Profile saved!", description: "Your profile has been updated." });
        const token = localStorage.getItem("cm_token");
        if (token && updatedUser) login(token, updatedUser);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      },
      onError: (err: any) => {
        toast({ title: "Save failed", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({ title: "Missing fields", description: "All password fields are required.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirm password must match.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    changePassword.mutate({
      data: { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
    }, {
      onSuccess: () => {
        toast({ title: "Password updated!", description: "Your password has been changed successfully." });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      },
      onError: (err: any) => {
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account details, Pi wallet, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card/50 border-border/50 text-center">
            <CardContent className="pt-6">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/30">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{user?.displayName || user?.username}</h3>
              <p className="text-sm text-muted-foreground mb-3">@{user?.username}</p>
              <p className="text-xs text-muted-foreground mb-4">{user?.email}</p>
              <Badge className="capitalize bg-primary/10 text-primary border border-primary/20">
                {user?.role} Account
              </Badge>
              {(user as any)?.isSeller && (
                <Badge className="ml-2 bg-violet-500/10 text-violet-400 border border-violet-500/20">Seller</Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">{user ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Purchases</span>
                <span className="font-medium">{user?.totalPurchases ?? 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile}>
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" value={profileForm.displayName} onChange={setProfile("displayName")} placeholder={user?.username} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input id="avatarUrl" type="url" value={profileForm.avatarUrl} onChange={setProfile("avatarUrl")} placeholder="https://..." className="bg-background/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profileForm.phone} onChange={setProfile("phone")} placeholder="+1234567890" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram Handle</Label>
                    <Input id="telegram" value={profileForm.telegramHandle} onChange={setProfile("telegramHandle")} placeholder="@username" className="bg-background/50" />
                  </div>
                </div>
                {(user as any)?.isSeller && (
                  <div className="space-y-2">
                    <Label htmlFor="sellerBio">Seller Bio</Label>
                    <Textarea id="sellerBio" value={profileForm.sellerBio} onChange={setProfile("sellerBio")} rows={3} placeholder="Tell buyers about yourself…" className="bg-background/50 resize-none" />
                  </div>
                )}
                <Button type="submit" disabled={updateProfile.isPending} className="w-full">
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {updateProfile.isPending ? "Saving…" : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={(e) => { e.preventDefault(); /* pi wallet saved with profile */ }}>
            <Card className="bg-gradient-to-br from-violet-900/20 to-purple-800/10 border-violet-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-yellow-400" />
                  Pi Wallet Address
                </CardTitle>
                <CardDescription>
                  Your Pi wallet address is used to receive payouts from sales and refunds from cancelled orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(user as any)?.piWalletAddress ? (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2 text-xs font-mono text-emerald-400 break-all">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {(user as any).piWalletAddress}
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
                    ⚠️ No Pi wallet address set. Add one below to receive funds.
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="piWallet">Pi Wallet Address</Label>
                  <Input
                    id="piWallet"
                    value={profileForm.piWalletAddress}
                    onChange={setProfile("piWalletAddress")}
                    placeholder="GDOUBLE... (Pi wallet address)"
                    className="bg-background/50 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sellers: funds from sales will be sent here. Buyers: refunds from rejected orders will be sent here.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="w-full bg-violet-600 hover:bg-violet-500"
                >
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                  {updateProfile.isPending ? "Saving…" : "Save Pi Wallet"}
                </Button>
              </CardContent>
            </Card>
          </form>

          <form onSubmit={handleChangePassword}>
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={setPassword("currentPassword")} className="bg-background/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={setPassword("newPassword")} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={setPassword("confirmPassword")} className="bg-background/50" />
                  </div>
                </div>
                <Button type="submit" variant="secondary" disabled={changePassword.isPending} className="w-full">
                  {changePassword.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {changePassword.isPending ? "Updating…" : "Update Password"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
