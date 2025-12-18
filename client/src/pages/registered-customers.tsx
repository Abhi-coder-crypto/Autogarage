import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Phone, MapPin, Search, Car, Mail, DollarSign, Calendar, Wrench } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PHASE_COLORS: Record<string, string> = {
  Inquired: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300",
  Working: "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300",
  Waiting: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300",
  Completed: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300",
};

const FUNNEL_STAGES = [
  { key: "Inquired", label: "Inquired" },
  { key: "Working", label: "Working" },
  { key: "Waiting", label: "Waiting" },
  { key: "Completed", label: "Completed" },
];

export default function RegisteredCustomers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.customers.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.jobs.list(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.customers.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const getCustomerJobHistory = (customerId: string) => {
    return jobs.filter((job: any) => job.customerId === customerId);
  };

  const filteredCustomers = customers.filter((customer: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameMatch = customer.name?.toLowerCase().includes(query);
    const phoneMatch = customer.phone?.includes(query);
    const vehicleMatch = customer.vehicles?.some((v: any) => 
      v.make?.toLowerCase().includes(query) ||
      v.model?.toLowerCase().includes(query) ||
      v.plateNumber?.toLowerCase().includes(query)
    );
    return nameMatch || phoneMatch || vehicleMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight" data-testid="text-registered-customers-title">
            Registered Customers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View and manage all registered customers
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
            data-testid="input-search-customer"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No customers found</div>
      ) : (
        <div className="space-y-2">
          {filteredCustomers.map((customer: any) => (
            <Card key={customer._id} className="cursor-pointer hover-elevate" data-testid={`customer-card-${customer._id}`}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header - Always visible */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{customer.name}</h3>
                        <Badge className={cn(PHASE_COLORS[customer.status || 'Inquired'])}>{customer.status || 'Inquired'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setExpandedCustomerId(expandedCustomerId === customer._id ? null : customer._id)}
                      data-testid={`button-toggle-details-${customer._id}`}
                    >
                      {expandedCustomerId === customer._id ? "▼" : "▶"} Details
                    </Button>
                  </div>

                  {/* Expanded details */}
                  {expandedCustomerId === customer._id && (
                    <div className="border-t pt-4 space-y-3">
                      {/* Contact info */}
                      {(customer.email || customer.address) && (
                        <div className="space-y-2 text-sm">
                          {customer.email && (
                            <p className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{customer.email}</span>
                            </p>
                          )}
                          {customer.address && (
                            <p className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">{customer.address}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Vehicles */}
                      {customer.vehicles && customer.vehicles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Vehicles</p>
                          {customer.vehicles.map((vehicle: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-accent/20 rounded text-sm">
                              <div className="flex items-center gap-2">
                                <Car className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{vehicle.make} {vehicle.model}</span>
                                {vehicle.plateNumber && <Badge variant="outline" className="text-xs">{vehicle.plateNumber}</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Service info */}
                      {customer.service && (
                        <div className="text-sm space-y-1">
                          <p className="font-medium">Service:</p>
                          <p className="text-muted-foreground">{customer.service}</p>
                          {customer.serviceCost && (
                            <p className="flex items-center gap-2 font-medium">
                              <DollarSign className="w-3.5 h-3.5" />
                              ₹{customer.serviceCost.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Job history */}
                      {getCustomerJobHistory(customer._id).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Service History ({getCustomerJobHistory(customer._id).length})</p>
                          {getCustomerJobHistory(customer._id).slice(0, 3).map((job: any) => (
                            <div key={job._id} className="text-xs p-2 bg-accent/10 rounded">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate">{job.vehicleName}</span>
                                <Badge variant="outline" className="text-xs">{job.stage}</Badge>
                              </div>
                              {job.createdAt && (
                                <p className="text-muted-foreground text-xs mt-1">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status change */}
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-sm font-medium">Update Status</p>
                        <Select value={customer.status || 'Inquired'} onValueChange={(value) => updateStatusMutation.mutate({id: customer._id, status: value})}>
                          <SelectTrigger className="h-8 text-sm" data-testid={`select-status-${customer._id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FUNNEL_STAGES.map((stage) => (
                              <SelectItem key={stage.key} value={stage.key} className="text-sm">
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/customer-service?customerId=${customer._id}`} className="flex-1">
                          <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-xs" data-testid={`button-create-service-${customer._id}`}>
                            <Wrench className="w-3 h-3 mr-1" />
                            Create Service
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
