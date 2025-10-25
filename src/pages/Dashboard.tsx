import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/integrations/firebase/client";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scan, Users, CheckCircle, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type Attendee = {
  id: string;
  attendee_name: string;
  ticket_code: string;
  checked_in_at: {
    seconds: number;
    nanoseconds: number;
  } | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, notCheckedIn: 0 });

  useEffect(() => {
    const attendeesRef = collection(db, "events", "my-first-event", "attendees");
    const q = query(attendeesRef, orderBy("attendee_name"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const attendeesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Attendee));
      
      setAttendees(attendeesData);

      const checkedInCount = attendeesData.filter(a => a.checked_in_at).length;
      setStats({
        total: attendeesData.length,
        checkedIn: checkedInCount,
        notCheckedIn: attendeesData.length - checkedInCount,
      });
    });

    return () => unsubscribe();
  }, []);

  const sortedAttendees = [...attendees].sort((a, b) => {
    if (a.checked_in_at && b.checked_in_at) {
      return b.checked_in_at.seconds - a.checked_in_at.seconds;
    }
    if (a.checked_in_at) return -1;
    if (b.checked_in_at) return 1;
    return a.attendee_name.localeCompare(b.attendee_name);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 pt-20">
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

        {/* Attendee List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">Attendee List</h2>
          <div className="space-y-3">
            {sortedAttendees.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No attendees found for this event.
              </p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 bg-muted/50 font-medium px-4 py-2">
                  <p>Attendee Name</p>
                  <p>Check-in Status</p>
                </div>
                {sortedAttendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="grid grid-cols-2 items-center p-4 border-t"
                  >
                    <div>
                      <p className="font-medium text-foreground">{attendee.attendee_name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{attendee.ticket_code}</p>
                    </div>
                    <div>
                      {attendee.checked_in_at ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="w-5 h-5" />
                          <span>
                            {format(new Date(attendee.checked_in_at.seconds * 1000), "Pp")}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-5 h-5" />
                          <span>Not Checked In</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
