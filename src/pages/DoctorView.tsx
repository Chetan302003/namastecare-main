import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, User, Calendar, FileText, AlertTriangle, CheckCircle2, AlertCircle, Activity, Pill, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "normal" || status === "green") return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
  if (status === "borderline" || status === "amber") return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
  return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
};

export default function DoctorView() {
  const { token } = useParams();
  const [member, setMember] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (token) fetchData(token);
  }, [token]);

  const fetchData = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('get_clinical_data_by_token', {
        token: token
      });

      if (error || !data) {
        console.error("RPC Error:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setMember(data.member);
      setRecords(data.records || []);
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error("Error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading patient summary...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Patient not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-green-700 px-4 py-6 text-white">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Heart className="h-6 w-6" />
          <div>
            <h1 className="text-lg font-bold leading-tight">NamasteCare</h1>
            <p className="text-sm opacity-80">Patient Summary</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card className="card-elevated border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">{member?.name}</h2>
                <p className="text-sm text-muted-foreground">{member?.age} yrs • {member?.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {records.length > 0 && records.map((record, idx) => {
          return (
            <Card key={record.id} className="card-elevated border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-700" />
                  {record.report_name || "Health Report"}
                </CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(record.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-sm text-foreground leading-relaxed">{record.summary}</p>
                
                {record.flags && record.flags.length > 0 && (
                  <div className="space-y-1.5">
                    {record.flags.map((flag: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-1 px-2 rounded bg-muted/50">
                        <StatusIcon status={flag.status} />
                        <span>{flag.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {record.file_path && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    onClick={() => {
                      const { data: { publicUrl } } = supabase.storage
                        .from('health-reports')
                        .getPublicUrl(record.file_path);
                      window.open(publicUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    View Original Report
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}

        {records.length === 0 && (
          <Card className="card-elevated border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">No health records uploaded yet.</p>
            </CardContent>
          </Card>
        )}

        {medicines.length > 0 && (
          <Card className="card-elevated border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill className="h-4 w-4 text-green-700" /> Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {medicines.map((med) => (
                <div key={med.id} className="text-sm py-1.5 px-2.5 rounded-md bg-muted/50">
                  <span className="font-medium text-foreground">{med.medicine_name}</span>{" "}
                  <span className="text-muted-foreground">{med.dosage} — {med.times?.join(", ")}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground py-4">
          Shared via NamasteCare • For medical use only
        </p>
      </div>
    </div>
  );
}