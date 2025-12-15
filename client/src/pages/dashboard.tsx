import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  Users,
  Package
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const JOB_STAGES = [
  'New Lead',
  'Inspection Done',
  'Work In Progress',
  'Ready for Delivery',
  'Completed',
  'Cancelled'
];

const STAGE_COLORS: Record<string, string> = {
  'New Lead': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Inspection Done': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Work In Progress': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Ready for Delivery': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Completed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard.stats,
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.jobs.list(),
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: api.inventory.lowStock,
  });

  const activeJobs = jobs.filter((j: any) => !['Completed', 'Cancelled'].includes(j.stage));
  const jobsByStage = JOB_STAGES.reduce((acc, stage) => {
    acc[stage] = jobs.filter((j: any) => j.stage === stage);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to RedLine Auto Garage CRM</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border" data-testid="card-total-jobs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-display font-bold mt-1">{stats?.totalJobs || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Car className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" data-testid="card-active-jobs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-3xl font-display font-bold mt-1">{stats?.activeJobs || 0}</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" data-testid="card-completed">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-display font-bold mt-1">{stats?.completedJobs || 0}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border" data-testid="card-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-display font-bold mt-1">
                  <span className="text-lg">₹</span>{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <IndianRupee className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((item: any) => (
                <Badge key={item._id} variant="outline" className="border-red-500/30 text-red-400">
                  {item.name}: {item.quantity} {item.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Job Funnel</h2>
          <Link href="/jobs">
            <span className="text-sm text-primary hover:underline cursor-pointer" data-testid="link-view-all-jobs">
              View all jobs →
            </span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {JOB_STAGES.filter(s => s !== 'Cancelled').map((stage) => (
            <Card key={stage} className="bg-card border-border overflow-hidden" data-testid={`funnel-${stage.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="truncate">{stage}</span>
                  <Badge variant="secondary" className="ml-2">
                    {jobsByStage[stage]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {jobsByStage[stage]?.slice(0, 5).map((job: any) => (
                  <Link key={job._id} href={`/jobs/${job._id}`}>
                    <div 
                      className="p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      data-testid={`job-card-${job._id}`}
                    >
                      <p className="font-medium text-sm truncate">{job.vehicleName}</p>
                      <p className="text-xs text-muted-foreground truncate">{job.plateNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">{job.customerName}</p>
                    </div>
                  </Link>
                ))}
                {(!jobsByStage[stage] || jobsByStage[stage].length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">No jobs</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job: any) => (
                <Link key={job._id} href={`/jobs/${job._id}`}>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    data-testid={`recent-job-${job._id}`}
                  >
                    <div>
                      <p className="font-medium">{job.vehicleName}</p>
                      <p className="text-sm text-muted-foreground">{job.customerName}</p>
                    </div>
                    <Badge className={cn("border", STAGE_COLORS[job.stage])}>
                      {job.stage}
                    </Badge>
                  </div>
                </Link>
              ))}
              {jobs.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No jobs yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/jobs?new=true">
              <div className="p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20" data-testid="action-new-job">
                <p className="font-medium text-primary">+ Create New Job</p>
                <p className="text-sm text-muted-foreground">Start a new service job</p>
              </div>
            </Link>
            <Link href="/customers?new=true">
              <div className="p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer border border-border" data-testid="action-new-customer">
                <p className="font-medium">+ Add Customer</p>
                <p className="text-sm text-muted-foreground">Register a new customer</p>
              </div>
            </Link>
            <Link href="/appointments?new=true">
              <div className="p-4 rounded-lg bg-accent hover:bg-accent/80 transition-colors cursor-pointer border border-border" data-testid="action-new-appointment">
                <p className="font-medium">+ Book Appointment</p>
                <p className="text-sm text-muted-foreground">Schedule a service slot</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
