import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Save, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGE_ORDER = [
  'New Lead',
  'Inspection Done',
  'Work In Progress',
  'Ready for Delivery',
  'Completed',
  'Cancelled'
];

const STAGE_DESCRIPTIONS: Record<string, string> = {
  'New Lead': 'Sent when a new job is created',
  'Inspection Done': 'Sent after vehicle inspection',
  'Work In Progress': 'Sent when work begins',
  'Ready for Delivery': 'Sent when vehicle is ready',
  'Completed': 'Sent after job completion',
  'Cancelled': 'Sent if job is cancelled'
};

export default function WhatsApp() {
  const [editedTemplates, setEditedTemplates] = useState<Record<string, { message: string; isActive: boolean }>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['whatsapp', 'templates'],
    queryFn: api.whatsapp.templates,
  });

  const updateMutation = useMutation({
    mutationFn: ({ stage, message, isActive }: { stage: string; message: string; isActive: boolean }) => 
      api.whatsapp.updateTemplate(stage, message, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp', 'templates'] });
      toast({ title: 'Template saved' });
    },
    onError: () => {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    }
  });

  const getTemplateForStage = (stage: string) => {
    const template = templates.find((t: any) => t.stage === stage);
    const edited = editedTemplates[stage];
    
    return {
      message: edited?.message ?? template?.message ?? '',
      isActive: edited?.isActive ?? template?.isActive ?? true
    };
  };

  const handleMessageChange = (stage: string, message: string) => {
    const current = getTemplateForStage(stage);
    setEditedTemplates(prev => ({
      ...prev,
      [stage]: { ...current, message }
    }));
  };

  const handleToggle = (stage: string, isActive: boolean) => {
    const current = getTemplateForStage(stage);
    setEditedTemplates(prev => ({
      ...prev,
      [stage]: { ...current, isActive }
    }));
  };

  const handleSave = (stage: string) => {
    const template = getTemplateForStage(stage);
    updateMutation.mutate({ stage, message: template.message, isActive: template.isActive });
    setEditedTemplates(prev => {
      const { [stage]: _, ...rest } = prev;
      return rest;
    });
  };

  const hasChanges = (stage: string) => {
    return stage in editedTemplates;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">WhatsApp Automation</h1>
        <p className="text-muted-foreground mt-1">Configure automatic messages for each job stage</p>
      </div>

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">API Integration Ready</p>
            <p className="text-sm text-muted-foreground mt-1">
              These templates are ready for WhatsApp API integration. When you add your API key, 
              messages will be sent automatically when job stages change. Use <code className="bg-accent px-1 rounded">{'{{vehicle}}'}</code> and <code className="bg-accent px-1 rounded">{'{{plate}}'}</code> as placeholders.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
        ) : (
          STAGE_ORDER.map((stage) => {
            const template = getTemplateForStage(stage);
            const changed = hasChanges(stage);
            
            return (
              <Card 
                key={stage} 
                className={cn(
                  "bg-card border-border",
                  changed && "border-primary/50"
                )}
                data-testid={`template-card-${stage.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{stage}</CardTitle>
                        <CardDescription>{STAGE_DESCRIPTIONS[stage]}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Active</span>
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={(checked) => handleToggle(stage, checked)}
                          data-testid={`toggle-${stage.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                      </div>
                      {changed && (
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          Unsaved
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={template.message}
                    onChange={(e) => handleMessageChange(stage, e.target.value)}
                    placeholder="Enter message template..."
                    className="min-h-24 resize-none"
                    data-testid={`textarea-${stage.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Placeholders: <code className="bg-accent px-1 rounded">{'{{vehicle}}'}</code>, <code className="bg-accent px-1 rounded">{'{{plate}}'}</code>
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleSave(stage)}
                      disabled={!changed || updateMutation.isPending}
                      className={cn(!changed && "opacity-50")}
                      data-testid={`save-${stage.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
