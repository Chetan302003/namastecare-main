import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Bell, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function HomePage() {
  const [userName, setUserName] = useState("there");
  const [recordsCount, setRecordsCount] = useState(0);
  const [familyCount, setFamilyCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "there");
      }
      const [{ count: healthCount }, { count: familyCount }, { count: medicineCount }] = await Promise.all([
        supabase.from("health_records").select("*", { count: "exact", head: true }),
        supabase.from("family_members").select("*", { count: "exact", head: true }),
        supabase.from("medicine_reminders").select("*", { count: "exact", head: true }),
      ]);
      setRecordsCount(healthCount || 0);
      setFamilyCount(familyCount || 0);
      setMedicineCount(medicineCount || 0);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="animate-reveal">
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          Namaste, {userName} 🙏
        </h1>
        <p className="text-muted-foreground mt-1">Here's your family's health overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link to="/dashboard/family">
          <Card className="card-elevated border-border hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-4">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : familyCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Family Members</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/records">
          <Card className="card-elevated border-border hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-4">
              <FileText className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : recordsCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Health Records</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/medicines">
          <Card className="card-elevated border-border hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-4">
              <Bell className="h-5 w-5 text-warning mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : medicineCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Medicine Reminders</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/records">
          <Card className="card-elevated border-border hover:border-primary/30 transition-all cursor-pointer">
            <CardContent className="p-4">
              <Activity className="h-5 w-5 text-danger mb-2" />
              <p className="text-2xl font-bold text-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active Conditions</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="card-elevated border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Welcome to NamasteCare. Start by adding a family member, then upload a health report to get an AI-powered clinical summary.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/dashboard/family" className="text-sm text-primary font-medium hover:underline">
              + Add Family Member
            </Link>
            <Link to="/dashboard/records" className="text-sm text-primary font-medium hover:underline">
              + Upload Health Record
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}