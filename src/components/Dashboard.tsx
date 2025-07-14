import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Mic, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Heart,
  BookOpen,
  Scale,
  Plus
} from 'lucide-react';
import { format, subDays, isToday, isYesterday } from 'date-fns';

interface Incident {
  id: string;
  timestamp: string;
  category: string;
  severity: number;
  location?: string;
  transcript: string;
  peopleInvolved: string[];
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    thisWeek: 0,
    avgSeverity: 0,
    mostCommonCategory: ''
  });

  useEffect(() => {
    // Load incidents from localStorage
    const savedIncidents = localStorage.getItem('childfirst_incidents');
    if (savedIncidents) {
      const parsedIncidents = JSON.parse(savedIncidents);
      setIncidents(parsedIncidents);
      calculateStats(parsedIncidents);
    }
  }, []);

  const calculateStats = (incidentList: Incident[]) => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    
    const thisWeekIncidents = incidentList.filter(
      incident => new Date(incident.timestamp) >= weekAgo
    );
    
    const avgSeverity = incidentList.length > 0 
      ? incidentList.reduce((sum, incident) => sum + incident.severity, 0) / incidentList.length
      : 0;
    
    const categoryCount: { [key: string]: number } = {};
    incidentList.forEach(incident => {
      categoryCount[incident.category] = (categoryCount[incident.category] || 0) + 1;
    });
    
    const mostCommonCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, ''
    );

    setStats({
      totalIncidents: incidentList.length,
      thisWeek: thisWeekIncidents.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      mostCommonCategory
    });
  };

  const getRecentIncidents = () => {
    return incidents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return 'bg-success text-success-foreground';
    if (severity <= 3) return 'bg-accent text-accent-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return 'Low';
    if (severity <= 3) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome to ChildFirst
            </h1>
            <p className="text-muted-foreground">
              Supporting your neurodivergent child's journey with documentation and resources
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-accent" />
            <span className="text-sm text-muted-foreground">Victoria, Australia</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/record">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-accent/20 hover:border-accent/40">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Mic className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Record Incident</h3>
                  <p className="text-sm text-muted-foreground">Voice recording with GPS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/timeline">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">View Timeline</h3>
                  <p className="text-sm text-muted-foreground">Chronological incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/resources">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-secondary/20 hover:border-secondary/40">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Resources</h3>
                  <p className="text-sm text-muted-foreground">Educational materials</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncidents}</div>
            <div className="flex items-center mt-1">
              <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">All time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSeverity || 'N/A'}</div>
            <div className="flex items-center mt-1">
              <AlertTriangle className="w-4 h-4 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">Out of 5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Common
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {stats.mostCommonCategory || 'No data'}
            </div>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className="text-xs">
                Category
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>
                Latest recorded incidents and observations
              </CardDescription>
            </div>
            <Link to="/timeline">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {getRecentIncidents().length > 0 ? (
            <div className="space-y-4">
              {getRecentIncidents().map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {getSeverityLabel(incident.severity)}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {incident.category}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(incident.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {incident.transcript}
                    </p>
                    {incident.location && (
                      <div className="flex items-center mt-2">
                        <MapPin className="w-3 h-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {incident.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No incidents recorded yet</h3>
              <p className="text-muted-foreground mb-4">
                Start documenting your child's experiences to build a comprehensive record
              </p>
              <Link to="/record">
                <Button>
                  <Mic className="w-4 h-4 mr-2" />
                  Record First Incident
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Tools Quick Access */}
      <Card className="bg-gradient-to-r from-secondary/5 to-accent/5 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-secondary" />
            <span>Legal Documentation</span>
          </CardTitle>
          <CardDescription>
            Prepare your documentation for legal proceedings or school meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/legal" className="flex-1">
              <Button variant="outline" className="w-full">
                Generate Report
              </Button>
            </Link>
            <Link to="/timeline" className="flex-1">
              <Button variant="outline" className="w-full">
                Export Timeline
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}