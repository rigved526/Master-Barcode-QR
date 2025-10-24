import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type CheckIn = {
  id: string;
  ticket_code: string;
  status: 'valid' | 'invalid' | 'duplicate';
  attendee_name: string | null;
  checked_in_at: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });

  const fetchCheckIns = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .order('checked_in_at', { ascending: false })
      .limit(50);

    if (data) {
      setCheckIns(data as CheckIn[]);
      
      const validCount = data.filter(c => c.status === 'valid').length;
      const invalidCount = data.filter(c => c.status === 'invalid' || c.status === 'duplicate').length;
      
      setStats({
        total: data.length,
        valid: validCount,
        invalid: invalidCount
      });
    }
  };

  useEffect(() => {
    fetchCheckIns();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('check-ins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'check_ins'
        },
        () => {
          fetchCheckIns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
              <span className="text-sm font-medium">Total Check-ins</span>
            </div>
            <p className="text-4xl font-bold text-foreground">{stats.total}</p>
          </Card>

          <Card className="p-6 space-y-2 bg-success/5 border-success/20">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Valid</span>
            </div>
            <p className="text-4xl font-bold text-success">{stats.valid}</p>
          </Card>

          <Card className="p-6 space-y-2 bg-error/5 border-error/20">
            <div className="flex items-center gap-2 text-error">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Invalid/Duplicate</span>
            </div>
            <p className="text-4xl font-bold text-error">{stats.invalid}</p>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">Recent Check-ins</h2>
          <div className="space-y-3">
            {checkIns.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No check-ins yet. Start scanning tickets!
              </p>
            )}
            
            {checkIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {checkIn.status === 'valid' ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {checkIn.attendee_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                      {checkIn.ticket_code}
                    </p>
                  </div>

                  <Badge 
                    variant={checkIn.status === 'valid' ? 'default' : 'destructive'}
                    className={checkIn.status === 'valid' ? 'bg-success hover:bg-success/90' : ''}
                  >
                    {checkIn.status}
                  </Badge>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(checkIn.checked_in_at), { addSuffix: true })}
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