import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState({
    garageName: 'AutoGarage',
    phone: '+91 98765 43210',
    email: 'contact@autogarage.com',
    address: 'Shop No. 15, Industrial Area, Pune',
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: api.whatsapp.templates,
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ stage, message, isActive }: { stage: string; message: string; isActive: boolean }) =>
      api.whatsapp.updateTemplate(stage, message, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] });
      toast({ title: 'Template updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update template', variant: 'destructive' });
    }
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated.",
    });
  };

  const handleTemplateUpdate = (stage: string, message: string, isActive: boolean) => {
    updateTemplateMutation.mutate({ stage, message, isActive });
  };

  const statusTemplates = [
    { status: 'Inquired', message: 'Thank you for your inquiry! We have received your service request for {{service}}. Our team will contact you shortly.' },
    { status: 'Working', message: 'Work has started on your vehicle for {{service}}. We will keep you updated on the progress.' },
    { status: 'Waiting', message: 'Your vehicle service ({{service}}) is currently on hold. We will notify you once we resume work.' },
    { status: 'Completed', message: 'Great news! Your {{service}} service has been completed. Please visit us to collect your vehicle.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your garage information and WhatsApp integration</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground font-medium flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Garage Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="garageName">Garage Name</Label>
              <Input 
                id="garageName"
                value={settings.garageName}
                onChange={(e) => setSettings({...settings, garageName: e.target.value})}
                className="bg-background border-border"
                data-testid="input-garage-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="bg-background border-border"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="bg-background border-border"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="bg-background border-border"
                data-testid="input-address"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground font-medium flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              WhatsApp Business API Setup
            </CardTitle>
            <CardDescription>
              Configure your WhatsApp Business Cloud API to send automatic status updates to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Setup Required</p>
                  <p className="text-amber-700 mt-1">
                    To enable WhatsApp messaging, you need to set the following environment variables in the Secrets tab:
                  </p>
                  <ul className="mt-2 space-y-1 text-amber-700">
                    <li><code className="bg-amber-100 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code> - Your WhatsApp Business phone number ID</li>
                    <li><code className="bg-amber-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> - Your permanent access token from Meta Developer Console</li>
                  </ul>
                  <p className="text-amber-700 mt-2">
                    Get these from the <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Meta Developer Console</a> after setting up WhatsApp Business Cloud API.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>How to get your credentials:</Label>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>Go to Meta Developer Console and create an app</li>
                <li>Add WhatsApp Business product to your app</li>
                <li>Go to WhatsApp &gt; API Setup to find your Phone Number ID</li>
                <li>Generate a permanent access token from System Users</li>
                <li>Add both values to the Secrets tab in this Replit</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground font-medium flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Customer Status Message Templates
            </CardTitle>
            <CardDescription>
              These messages are sent automatically when you update a customer's service status.
              Use <code className="bg-muted px-1 rounded">{'{{service}}'}</code> to include the service name.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusTemplates.map((template) => (
              <div key={template.status} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-sm">
                    {template.status}
                  </Badge>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">{template.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground font-medium">Job Stage Templates</CardTitle>
            <CardDescription>
              Templates for job stage notifications (for service jobs workflow)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Loading templates...</p>
            ) : (
              templates.map((template: any) => (
                <div key={template.stage} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.stage}</Badge>
                    <Switch
                      checked={template.isActive}
                      onCheckedChange={(checked) => handleTemplateUpdate(template.stage, template.message, checked)}
                    />
                  </div>
                  <Textarea
                    value={template.message}
                    onChange={(e) => {
                      const newTemplates = templates.map((t: any) =>
                        t.stage === template.stage ? { ...t, message: e.target.value } : t
                      );
                      queryClient.setQueryData(['whatsapp-templates'], newTemplates);
                    }}
                    onBlur={() => handleTemplateUpdate(template.stage, template.message, template.isActive)}
                    className="text-sm"
                    rows={2}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90" data-testid="button-save-settings">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
