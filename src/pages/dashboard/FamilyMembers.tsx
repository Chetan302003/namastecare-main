import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Phone, QrCode, User } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { db as supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  age: string;
  gender: string;
  phone_number: string;
  doctor_view_token: string;
}

export default function FamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showQr, setShowQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone_number: "" });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data, error } = await supabase
        .from("family_members")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.age || !form.gender) {
      toast.error("Please fill name, age and gender");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const token = crypto.randomUUID();
      const { error } = await supabase
        .from("family_members")
        .insert({
          user_id: user.id,
          name: form.name,
          age: form.age,
          gender: form.gender,
          phone_number: form.phone_number,
          doctor_view_token: token
        });
      if (error) throw error;
      toast.success("Family member added!");
      setForm({ name: "", age: "", gender: "", phone_number: "" });
      setOpen(false);
      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between animate-reveal">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Family Members</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your family's health profiles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="e.g. Meera Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" placeholder="e.g. 35" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+91 98765 43210" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </div>
              <Button className="w-full" onClick={handleAdd} disabled={saving}>
                {saving ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No family members yet. Add your first member.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {userId && (
            <Card key="self" className="card-elevated border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">Self</p>
                        <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 rounded px-1.5 py-0.5">Profile</span>
                        <Button variant="ghost" size="icon" className="p-0" onClick={() => setShowQr(showQr === "self" ? null : "self") }>
                          <QrCode className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">My profile QR code</p>
                    </div>
                  </div>
                </div>
                {showQr === "self" && (
                  <div className="mt-4 flex justify-center p-4 bg-card rounded-lg border border-border">
                    <QRCodeSVG
                      value={`${window.location.origin}/doctor/self-${userId}`}
                      size={140}
                      level="M"
                      fgColor="hsl(152, 55%, 33%)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {members.map((member, i) => (
            <Card key={member.id} className="card-elevated border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 rounded px-1.5 py-0.5">Self</span>
                        <Button variant="ghost" size="icon" className="p-0" onClick={() => setShowQr(showQr === member.id ? null : member.id)}>
                          <QrCode className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.age} yrs • {member.gender}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-sm">
                  {member.phone_number && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {member.phone_number}
                    </div>
                  )}
                </div>
                {showQr === member.id && (
                  <div className="mt-4 flex justify-center p-4 bg-card rounded-lg border border-border">
                    <QRCodeSVG
                      value={`${window.location.origin}/doctor/${member.doctor_view_token}`}
                      size={140}
                      level="M"
                      fgColor="hsl(152, 55%, 33%)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}