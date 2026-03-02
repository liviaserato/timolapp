import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, UserPlus, RotateCcw, Loader2 } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ResumeRegistrationPopup } from "@/components/screens/ResumeRegistrationPopup";
import { ForgotPasswordPopup } from "@/components/login/ForgotPasswordPopup";
import { ForgotUsernamePopup } from "@/components/login/ForgotUsernamePopup";
import { LoginPromoBanner } from "@/components/login/LoginPromoBanner";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";
import waterDropsBg from "@/assets/water-drops-bg.jpg";

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [showForgotUser, setShowForgotUser] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = t("validation.required");
    if (!password) e.password = t("validation.required");
    else if (password.length < 6) e.password = t("validation.passwordMin");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setErrors({ general: t("login.error.invalid") });
    }, 1500);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${waterDropsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Language selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Main container: promo + login side by side */}
      <div className="relative z-10 flex rounded-xl overflow-hidden shadow-2xl max-w-4xl w-full">
        {/* Promo banner - hidden on mobile */}
        <LoginPromoBanner className="hidden lg:flex w-[420px] shrink-0" />

        {/* Login card */}
        <Card className="w-full border-0 rounded-none lg:rounded-r-xl bg-card/95 backdrop-blur-sm">
          <CardContent className="flex flex-col gap-5 pt-8 pb-6 px-6">
            {/* Logo + title */}
            <div className="text-center space-y-4">
              <img src={timolLogoDark} alt="Timol" className="h-10 mx-auto" />
              <h1 className="text-lg font-bold text-primary leading-tight">
                {t("login.title")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t("login.subtitle")}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="login-user">{t("login.username")}</Label>
                <Input
                  id="login-user"
                  placeholder={t("login.username.placeholder")}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: "", general: "" }));
                  }}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="login-pass">{t("login.password")}</Label>
                <div className="relative">
                  <Input
                    id="login-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.password.placeholder")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "", general: "" }));
                    }}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="pr-9"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(!!v)}
                />
                <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                  {t("login.rememberMe")}
                </label>
              </div>

              {/* General error */}
              {errors.general && (
                <p className="text-xs text-destructive text-center">{errors.general}</p>
              )}

              {/* Login button */}
              <Button className="w-full gap-2" onClick={handleLogin} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {t("login.enter")}
              </Button>

              {/* Forgot links */}
              <div className="flex justify-center gap-4 text-xs">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                  onClick={() => setShowForgotPw(true)}
                >
                  {t("login.forgotPassword")}
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                  onClick={() => setShowForgotUser(true)}
                >
                  {t("login.forgotUsername")}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">
                  {t("login.or")}
                </span>
              </div>
            </div>

            {/* Secondary actions */}
            <div className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full gap-2 text-sm"
                onClick={() => navigate("/cadastro")}
              >
                <UserPlus className="h-4 w-4" />
                {t("login.newFranchisee")}
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 text-sm text-muted-foreground"
                onClick={() => setShowResume(true)}
              >
                <RotateCcw className="h-4 w-4" />
                {t("login.resumeRegistration")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Registration Popup */}
      <ResumeRegistrationPopup
        open={showResume}
        onClose={() => setShowResume(false)}
      />

      {/* Forgot Password Popup */}
      <ForgotPasswordPopup
        open={showForgotPw}
        onClose={() => setShowForgotPw(false)}
        onSwitchToUsername={() => setShowForgotUser(true)}
      />

      {/* Forgot Username Popup */}
      <ForgotUsernamePopup
        open={showForgotUser}
        onClose={() => setShowForgotUser(false)}
      />
    </div>
  );
};

export default Login;
