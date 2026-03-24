import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Clock, MessageCircle, Plus, Phone, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Medicine {
  id: string;
  medicine_name: string;
  dosage: string;
  times: string[];
  active: boolean;
  family_member_id: string;
  member_name?: string;
  phone_number?: string;
  auto_call_enabled?: boolean;
}

export default function MedicineReminders() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [user, setUser] = useState<{ id: string; name: string | null; phone?: string | null } | null>(null);
  const [form, setForm] = useState({
    medicine_name: "",
    dosage: "",
    times: "",
    family_member_id: "",
    auto_call_enabled: false,
    reminder_phone_number: ""
  });

  useEffect(() => {
    fetchMedicines();
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser({ id: user.id, name: user.user_metadata?.name || user.email?.split("@")[0] || "Self", phone: user.user_metadata?.phone });
    const { data } = await supabase
      .from("family_members")
      .select("*")
      .eq("user_id", user.id);
    setMembers(data || []);
  };

  const fetchMedicines = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: memberData } = await supabase
        .from("family_members")
        .select("id, name, phone_number")
        .eq("user_id", authUser.id);

      const memberIds = (memberData || []).map(m => m.id);
      if (authUser.id && !memberIds.includes(authUser.id)) {
        memberIds.push(authUser.id);
      }

      const { data: reminders } = await supabase
        .from("medicine_reminders")
        .select("*")
        .in("family_member_id", memberIds)
        .eq("active", true);

      const enriched = (reminders || []).map(r => {
        const member = memberData.find(m => m.id === r.family_member_id);
        const isSelf = user?.id && r.family_member_id === user.id;

        return {
          ...r,
          member_name: isSelf ? (user?.name || "Self") : (member?.name || "Unknown"),
          phone_number: isSelf ? (user?.phone || member?.phone_number || "") : (member?.phone_number || "")
        };
      });

      setMedicines(enriched);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.medicine_name || !form.family_member_id) {
      toast.error("Please fill medicine name and select family member");
      return;
    }
    setSaving(true);
    try {
      const memberId = form.family_member_id === "self" ? user?.id : form.family_member_id;
      if (!memberId) {
        toast.error("Please select a valid member");
        setSaving(false);
        return;
      }

      const timesArray = form.times.split(",").map(t => t.trim()).filter(Boolean);
      const { error } = await supabase
        .from("medicine_reminders")
        .insert({
          medicine_name: form.medicine_name,
          dosage: form.dosage,
          times: timesArray,
          family_member_id: memberId,
          active: true,
          auto_call_enabled: form.auto_call_enabled,
          reminder_phone_number: form.reminder_phone_number || undefined
        });
      if (error) throw error;
      toast.success("Medicine reminder added!");
      setForm({ medicine_name: "", dosage: "", times: "", family_member_id: "", auto_call_enabled: false, reminder_phone_number: "" });
      setOpen(false);
      fetchMedicines();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add reminder");
    } finally {
      setSaving(false);
    }
  };

  const sendWhatsApp = (med: Medicine) => {
    const firstName = med.member_name?.split(" ")[0] || "there";
    const message = encodeURIComponent(
      `💊 Medicine Reminder — NamasteCare\n\nNamaste ${firstName} ji,\nAapki dawai lene ka waqt ho gaya hai:\n\n• ${med.medicine_name} ${med.dosage}\n• Time: ${med.times?.join(", ")}\n\nSwasth rahein! 🙏`
    );
    const phone = med.phone_number?.replace(/[^0-9]/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const triggerBotCall = async (med: Medicine) => {
    const phone = med.phone_number || "";
    if (!phone) {
      toast.error("No phone number found for this member");
      return;
    }

    const toastId = toast.loading("Initiating automated call...");
    try {
      const { data, error } = await supabase.functions.invoke("send-medicine-reminder", {
        body: {
          medicine_name: med.medicine_name,
          dosage: med.dosage,
          member_name: med.member_name,
          phone_number: phone
        }
      });

      if (error) throw error;
      toast.success(data.message || "Call initiated successfully!", { id: toastId });
    } catch (error) {
      console.error("Bot call error:", error);
      toast.error("Failed to trigger bot call", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between animate-reveal">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medicine Reminders</h1>
          <p className="text-muted-foreground text-sm mt-1">Send timely medicine reminders via WhatsApp</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Reminder</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Medicine Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Family Member</Label>
                <select
                  className="w-full border border-input rounded-md px-3 py-2 text-sm"
                  value={form.family_member_id}
                  onChange={(e) => setForm({ ...form, family_member_id: e.target.value })}
                >                  <option value="">Select member</option>
                  <option value="self">Self</option>                  <option value="">Select member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Medicine Name</Label>
                <Input placeholder="e.g. Metformin" value={form.medicine_name} onChange={(e) => setForm({ ...form, medicine_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Dosage</Label>
                <Input placeholder="e.g. 500mg" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Times (comma separated)</Label>
                <Input placeholder="e.g. 8:00 AM, 8:00 PM" value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="auto_call_enabled"
                  checked={form.auto_call_enabled}
                  onChange={(e) => setForm({ ...form, auto_call_enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="auto_call_enabled" className="flex items-center gap-1.5 cursor-pointer">
                  <Bot className="h-4 w-4 text-primary" /> Enable Automated Voice Call
                </Label>
              </div>
              {form.auto_call_enabled && (
                <div className="space-y-2 animate-in slide-in-from-top-1">
                  <Label>Call Phone Number</Label>
                  <Input 
                    placeholder="e.g. +919876543210" 
                    value={form.reminder_phone_number} 
                    onChange={(e) => setForm({ ...form, reminder_phone_number: e.target.value })} 
                  />
                  <p className="text-[10px] text-muted-foreground">The bot will call this number at the set times.</p>
                </div>
              )}
              <Button className="w-full" onClick={handleAdd} disabled={saving}>
                {saving ? "Adding..." : "Add Reminder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : medicines.length === 0 ? (
        <p className="text-muted-foreground text-sm">No medicine reminders yet. Add your first reminder.</p>
      ) : (
        <div className="space-y-3">
          {medicines.map((med) => (
            <Card key={med.id} className="card-elevated border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {med.medicine_name} <span className="font-normal text-muted-foreground">{med.dosage}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{med.member_name}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{med.times?.join(", ")}</span>
                      </div>
                      {med.auto_call_enabled && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-primary font-medium">
                          <Bot className="h-3 w-3" />
                          <span>Voice Bot Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="default" size="sm" className="flex-shrink-0 bg-green-600 hover:bg-green-700" onClick={() => sendWhatsApp(med)}>
                    <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                  </Button>
                  {med.auto_call_enabled && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-shrink-0 border-primary text-primary hover:bg-primary/5"
                      onClick={() => triggerBotCall(med)}
                    >
                      <Phone className="h-4 w-4 mr-1" /> Test Call
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}