import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Users, BookOpen, Layers, Eye, TrendingUp, Globe, LogOut, Mail, Trash2, Download } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";

type PageView = {
  id: string;
  page_path: string;
  visitor_id: string | null;
  referrer: string | null;
  country: string | null;
  created_at: string;
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142 76% 36%)",
  "hsl(200 80% 50%)",
  "hsl(45 93% 47%)",
  "hsl(280 65% 60%)",
];

const chartConfig: ChartConfig = {
  views: { label: "Vues", color: "hsl(var(--primary))" },
  visitors: { label: "Visiteurs", color: "hsl(var(--accent))" },
};

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ articles: 0, programs: 0, projects: 0, team: 0 });
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [period, setPeriod] = useState("7");
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; name: string | null; created_at: string }[]>([]);

  const handleLogout = async () => { await signOut(); navigate("/login"); };

  useEffect(() => {
    const fetchStats = async () => {
      const [articles, programs, projects, team] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("programs").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("team_members").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        articles: articles.count || 0,
        programs: programs.count || 0,
        projects: projects.count || 0,
        team: team.count || 0,
      });
    };
    fetchStats();
    const fetchSubscribers = async () => {
      const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
      setSubscribers((data as any[]) || []);
    };
    fetchSubscribers();
  }, []);

  useEffect(() => {
    const fetchViews = async () => {
      setLoading(true);
      const since = subDays(new Date(), parseInt(period)).toISOString();
      const { data } = await supabase
        .from("page_views")
        .select("id, page_path, visitor_id, referrer, country, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);
      setPageViews((data as PageView[]) || []);
      setLoading(false);
    };
    fetchViews();
  }, [period]);

  const cards = [
    { label: "Articles", count: stats.articles, icon: FileText, color: "text-primary" },
    { label: "Programmes", count: stats.programs, icon: BookOpen, color: "text-accent" },
    { label: "Projets", count: stats.projects, icon: Layers, color: "text-primary" },
    { label: "Équipe", count: stats.team, icon: Users, color: "text-accent" },
  ];

  // Derived analytics
  const totalViews = pageViews.length;
  const uniqueVisitors = new Set(pageViews.map((v) => v.visitor_id).filter(Boolean)).size;

  const dailyData = useMemo(() => {
    const days = parseInt(period);
    const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
    return interval.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayViews = pageViews.filter((v) => v.created_at.startsWith(dayStr));
      return {
        date: format(day, "dd MMM", { locale: fr }),
        views: dayViews.length,
        visitors: new Set(dayViews.map((v) => v.visitor_id).filter(Boolean)).size,
      };
    });
  }, [pageViews, period]);

  const topPages = useMemo(() => {
    const map: Record<string, number> = {};
    pageViews.forEach((v) => {
      map[v.page_path] = (map[v.page_path] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [pageViews]);

  const topCountries = useMemo(() => {
    const map: Record<string, number> = {};
    pageViews.forEach((v) => {
      const country = v.country || "Inconnu";
      map[country] = (map[country] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [pageViews]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-foreground">Dashboard</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="font-display font-bold text-3xl text-card-foreground">{card.count}</p>
          </div>
        ))}
      </div>

      {/* Visitor summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pages vues</span>
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <p className="font-display font-bold text-3xl text-card-foreground">{totalViews}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Visiteurs uniques</span>
            <Users className="h-5 w-5 text-accent" />
          </div>
          <p className="font-display font-bold text-3xl text-card-foreground">{uniqueVisitors}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pages / visiteur</span>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <p className="font-display font-bold text-3xl text-card-foreground">
            {uniqueVisitors ? (totalViews / uniqueVisitors).toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Période :</span>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="14">14 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line chart – daily views & visitors */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground">Vues & Visiteurs par jour</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement…</div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <LineChart data={dailyData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="visitors" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </div>

        {/* Bar chart – top pages */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground">Pages les plus visitées</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement…</div>
          ) : (
            <ChartContainer config={{ value: { label: "Vues", color: "hsl(var(--primary))" } }} className="h-64 w-full">
              <BarChart data={topPages} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie chart – referrers */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" /> Pays des visiteurs
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Chargement…</div>
          ) : topCountries.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Aucune donnée</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topCountries} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {topCountries.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent visits table */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground">Visites récentes</h2>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageViews.slice(0, 20).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-xs">{v.page_path}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(v.created_at), "dd/MM HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
                {pageViews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Aucune visite enregistrée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Newsletter subscribers */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> Abonnés Newsletter ({subscribers.length})
          </h2>
          {subscribers.length > 0 && (
            <button
              onClick={() => {
                const csv = "Nom,Email,Date\n" + subscribers.map((s) => `"${s.name || ""}","${s.email}","${format(new Date(s.created_at), "dd/MM/yyyy")}"`).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href = url; a.download = "newsletter_subscribers.csv"; a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-input text-muted-foreground hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.name || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(s.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={async () => {
                        await supabase.from("newsletter_subscribers").delete().eq("id", s.id);
                        setSubscribers((prev) => prev.filter((x) => x.id !== s.id));
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {subscribers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucun abonné
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
