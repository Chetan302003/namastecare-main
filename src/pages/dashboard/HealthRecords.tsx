import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertTriangle, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db as supabase } from "@/lib/supabase";

interface HealthFlag {
  label: string;
  status: "green" | "amber" | "red";
}

interface HealthRecord {
  id: string;
  report_name: string;
  report_date: string;
  member_name: string;
  status: "normal" | "warning" | "critical";
  summary: string;
  flags: HealthFlag[];
  original_filename: string | null;
  file_path: string | null;
  created_at: string;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "green") return <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />;
  if (status === "amber") return <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />;
  return <AlertCircle className="h-4 w-4 text-danger flex-shrink-0" />;
};

export default function HealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
    } else {
      setRecords((data as unknown as HealthRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleViewReport = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("health-reports")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("Error viewing report:", error);
      toast({
        title: "Error",
        description: "Could not open the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload a JPG, PNG, WebP image or PDF.", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    toast({ title: "Analyzing report…", description: "Gemini AI is reading your health report." });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please log in first");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberName", "Self");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-report`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Analysis failed");
      }

      toast({ title: "Report analyzed!", description: `${result.record.report_name} added to your records.` });
      if (result.record) {
        setRecords((prev) => [result.record, ...prev]);
      } else {
        await fetchRecords();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again with a clearer image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between animate-reveal">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health Records</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload reports and get AI-powered clinical summaries</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Analyzing…</>
            ) : (
              <><Upload className="h-4 w-4 mr-1" /> Upload Report</>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : records.length === 0 ? (
        <Card className="card-elevated border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No health records yet</p>
            <p className="text-muted-foreground text-sm mt-1">Upload a lab report photo or PDF to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((record, i) => (
            <Card key={record.id} className={`card-elevated border-border animate-reveal animate-reveal-delay-${Math.min(i + 1, 3)}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.status === "normal" ? "bg-success/10" : record.status === "warning" ? "bg-warning/10" : "bg-danger/10"
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        record.status === "normal" ? "text-success" : record.status === "warning" ? "text-warning" : "text-danger"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{record.report_name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{record.member_name} • {formatDate(record.report_date)}</p>
                    </div>
                  </div>
                  {record.file_path && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs gap-1.5 h-8"
                      onClick={() => handleViewReport(record.file_path!)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Original
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground leading-relaxed">{record.summary}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(record.flags as HealthFlag[]).map((flag) => (
                    <div key={flag.label} className="flex items-center gap-2 text-sm py-1.5 px-2.5 rounded-md bg-muted/50">
                      <StatusIcon status={flag.status} />
                      <span className="text-foreground">{flag.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
