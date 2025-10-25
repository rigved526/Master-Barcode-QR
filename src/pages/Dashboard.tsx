import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, Users, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Ticket = {
  id: string;
  ticket_code: string;
  attendee_name: string;
  event_name: string;
  checked_in_at: string | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, notCheckedIn: 0 });

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('tickets')
      .select('*')
      .order('checked_in_at', { ascending: false, nullsFirst: false });

    if (data) {
      setTickets(data as Ticket[]);
      
      const checkedInCount = data.filter(t => t.checked_in_at !== null).length;
      
      setStats({
        total: data.length,
        checkedIn: checkedInCount,
        notCheckedIn: data.length - checkedInCount
      });
    }
  };

  useEffect(() => {
    fetchTickets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkedInTickets = tickets.filter(t => t.checked_in_at !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Master Dashboard</h1>
            <p className="text-muted-foreground">Real-time check-in monitoring</p>
          </div>
          <Button
            onClick={() => navigate('/scanner')}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Scan className="w-4 h-4" />
            Open Scanner
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Total Tickets</span>
            </div>
            <p className="text-4xl font-bold text-foreground">{stats.total}</p>
          </Card>

          <Card className="p-6 space-y-2 bg-success/5 border-success/20">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Checked In</span>
            </div>
            <p className="text-4xl font-bold text-success">{stats.checkedIn}</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Not Checked In</span>
            </div>
            <p className="text-4xl font-bold text-foreground">{stats.notCheckedIn}</p>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">Recent Check-ins</h2>
          <div className="space-y-3">
            {checkedInTickets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No check-ins yet. Start scanning tickets!
              </p>
            )}
            
            {checkedInTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {ticket.attendee_name}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {ticket.ticket_code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {ticket.event_name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(ticket.checked_in_at!), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
