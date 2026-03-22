import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, AlertCircle } from "lucide-react";

export default function InternalDashboard() {
  const { t } = useLanguage();

  const stats = [
    { label: t("internal.dashboard.pendingRegistrations"), value: "12", icon: FileText, color: "text-amber-500" },
    { label: t("internal.dashboard.activeFranchisees"), value: "348", icon: Users, color: "text-emerald-500" },
    { label: t("internal.dashboard.monthlyGrowth"), value: "+8.2%", icon: TrendingUp, color: "text-blue-500" },
    { label: t("internal.dashboard.openTickets"), value: "5", icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("internal.dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("internal.dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">{t("internal.dashboard.placeholder")}</p>
          <p className="text-sm mt-1">{t("internal.dashboard.placeholderHint")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
