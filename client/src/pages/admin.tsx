import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, MousePointerClick, Lock, Settings, ShieldAlert, FileText, TrendingUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [aboutContent, setAboutContent] = useState("");
  const { toast } = useToast();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics", password],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics?password=${password}`);
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    enabled: isAuthorized,
  });

  const chartData = analytics?.trends?.map((t: any) => ({
    date: new Date(t.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    Aufrufe: t.pageViews,
    Klicks: t.discordClicks
  })).reverse() || [];

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["/api/admin/config", password],
    queryFn: async () => {
      const res = await fetch(`/api/admin/config?password=${password}`);
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    enabled: isAuthorized,
  });

  const { data: aboutData } = useQuery({
    queryKey: ["/api/admin/about", password],
    queryFn: async () => {
      const res = await fetch(`/api/admin/about?password=${password}`);
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    enabled: isAuthorized,
  });

  useEffect(() => {
    if (aboutData?.content) {
      setAboutContent(aboutData.content);
    }
  }, [aboutData]);

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: any) => {
      const res = await apiRequest("POST", `/api/admin/config?password=${password}`, newConfig);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config", password] });
      toast({ title: "Konfiguration gespeichert" });
    },
    onError: () => {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    }
  });

  const updateAboutMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/admin/about?password=${password}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/about", password] });
      toast({ title: "About Us gespeichert" });
    },
    onError: () => {
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorized(true);
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Admin Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
              <Button type="submit" className="w-full" data-testid="button-admin-login">
                Anmelden
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Website Aufrufe</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-page-views">
              {analyticsLoading ? "..." : analytics?.pageViews}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discord Klicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-discord-clicks">
              {analyticsLoading ? "..." : analytics?.discordClicks}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>Analytics Trends (Letzte 30 Tage)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#888" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Aufrufe" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Klicks" 
                  stroke="#5865F2" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle>About Us Editor (Markdown)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            placeholder="# Title..."
            data-testid="textarea-about-md"
          />
          <Button 
            onClick={() => updateAboutMutation.mutate(aboutContent)}
            disabled={updateAboutMutation.isPending}
            className="w-full"
            data-testid="button-save-about"
          >
            {updateAboutMutation.isPending ? "Speichern..." : "About Us Speichern"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle>System-Konfiguration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="maintenance">Wartungsmodus</Label>
              <span className="text-xs text-muted-foreground">Deaktiviert die Bestenliste für Nutzer.</span>
            </div>
            <Switch
              id="maintenance"
              checked={config?.maintenanceMode === "true"}
              onCheckedChange={(checked) => 
                updateConfigMutation.mutate({ maintenanceMode: checked ? "true" : "false" })
              }
              data-testid="switch-maintenance-mode"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-url">Externe API URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                defaultValue={config?.externalApiUrl}
                placeholder="https://api..."
                className="font-mono text-xs"
                onBlur={(e) => {
                  if (e.target.value !== config?.externalApiUrl) {
                    updateConfigMutation.mutate({ externalApiUrl: e.target.value });
                  }
                }}
                data-testid="input-api-url"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
