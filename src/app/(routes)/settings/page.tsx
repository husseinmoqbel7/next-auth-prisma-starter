import SettingsForm from "@/components/auth/settings-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Settings = async () => {
  return (
    <Card className="w-[650px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">Settings</p>
      </CardHeader>
      <CardContent>
        <SettingsForm />
      </CardContent>
    </Card>
  );
};

export default Settings;
