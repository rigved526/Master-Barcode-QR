import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scan, LayoutDashboard, Ticket } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Event Check-in System</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Event Check-in
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scan tickets instantly, verify purchases in real-time, and monitor your event with a powerful dashboard
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <Card className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/scanner')}>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <Scan className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Ticket Scanner</h2>
              <p className="text-muted-foreground">
                Scan barcodes and QR codes to verify attendee tickets with instant validation
              </p>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
                Open Scanner
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => navigate('/dashboard')}>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <LayoutDashboard className="w-7 h-7 text-primary group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Master Dashboard</h2>
              <p className="text-muted-foreground">
                Monitor all check-ins in real-time with live updates and comprehensive analytics
              </p>
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
                View Dashboard
              </Button>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">System Features</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Scan className="w-6 h-6 text-success" />
                </div>
                <h4 className="font-semibold text-foreground">Fast Scanning</h4>
                <p className="text-sm text-muted-foreground">Instant barcode & QR code recognition</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <LayoutDashboard className="w-6 h-6 text-success" />
                </div>
                <h4 className="font-semibold text-foreground">Live Updates</h4>
                <p className="text-sm text-muted-foreground">Real-time check-in monitoring</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Ticket className="w-6 h-6 text-success" />
                </div>
                <h4 className="font-semibold text-foreground">Smart Validation</h4>
                <p className="text-sm text-muted-foreground">Duplicate detection & verification</p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="gap-2"
            >
              <Ticket className="w-4 h-4" />
              Manage Tickets
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
