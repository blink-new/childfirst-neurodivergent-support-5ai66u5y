import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  MapPin, 
  Users, 
  AlertTriangle,
  Clock,
  FileText,
  Trash2
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useToast } from '../hooks/use-toast';

interface Incident {
  id: string;
  timestamp: string;
  category: string;
  severity: number;
  location?: string;
  transcript: string;
  peopleInvolved: string[];
}

export default function IncidentTimeline() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [filterIncidents]);

  const loadIncidents = () => {
    const savedIncidents = localStorage.getItem('childfirst_incidents');
    if (savedIncidents) {
      const parsedIncidents = JSON.parse(savedIncidents);
      setIncidents(parsedIncidents);
    }
  };

  const filterIncidents = useCallback(() => {
    let filtered = [...incidents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(incident => incident.category === categoryFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      const severityRange = severityFilter.split('-').map(Number);
      filtered = filtered.filter(incident => 
        incident.severity >= severityRange[0] && incident.severity <= severityRange[1]
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredIncidents(filtered);
  }, [incidents, searchTerm, categoryFilter, severityFilter, sortOrder]);

  const deleteIncident = (id: string) => {
    const updatedIncidents = incidents.filter(incident => incident.id !== id);
    setIncidents(updatedIncidents);
    localStorage.setItem('childfirst_incidents', JSON.stringify(updatedIncidents));
    
    toast({
      title: "Incident deleted",
      description: "The incident has been removed from your records.",
    });
  };

  const exportToPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('ChildFirst - Incident Timeline Report', 20, 20);
      
      // Date range
      doc.setFontSize(12);
      doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 35);
      doc.text(`Total Incidents: ${filteredIncidents.length}`, 20, 45);
      
      let yPosition = 60;
      
      filteredIncidents.forEach((incident, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Incident header
        doc.setFontSize(14);
        doc.text(`${index + 1}. ${incident.category}`, 20, yPosition);
        
        yPosition += 10;
        doc.setFontSize(10);
        doc.text(`Date: ${format(parseISO(incident.timestamp), 'PPpp')}`, 25, yPosition);
        
        yPosition += 7;
        doc.text(`Severity: ${incident.severity}/5`, 25, yPosition);
        
        if (incident.location) {
          yPosition += 7;
          doc.text(`Location: ${incident.location}`, 25, yPosition);
        }
        
        if (incident.peopleInvolved.length > 0) {
          yPosition += 7;
          doc.text(`People: ${incident.peopleInvolved.join(', ')}`, 25, yPosition);
        }
        
        // Transcript
        yPosition += 10;
        doc.setFontSize(9);
        const splitText = doc.splitTextToSize(incident.transcript, 160);
        doc.text(splitText, 25, yPosition);
        yPosition += splitText.length * 4 + 10;
      });
      
      doc.save('childfirst-timeline-report.pdf');
      
      toast({
        title: "Export successful",
        description: "Timeline report has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to generate PDF report.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Severity', 'Location', 'People Involved', 'Transcript'];
    const csvData = filteredIncidents.map(incident => [
      format(parseISO(incident.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      incident.category,
      incident.severity.toString(),
      incident.location || '',
      incident.peopleInvolved.join('; '),
      `"${incident.transcript.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'childfirst-timeline-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Timeline data has been downloaded as CSV.",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, yyyy h:mm a');
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

  const getUniqueCategories = () => {
    return [...new Set(incidents.map(incident => incident.category))];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Incident Timeline</h1>
          <p className="text-muted-foreground">
            Chronological view of all documented incidents
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="1-2">Low (1-2)</SelectItem>
                <SelectItem value="3-3">Medium (3)</SelectItem>
                <SelectItem value="4-5">High (4-5)</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident, index) => (
            <Card key={incident.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {getSeverityLabel(incident.severity)}
                      </Badge>
                      <h3 className="text-lg font-semibold">{incident.category}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimestamp(incident.timestamp)}
                      </div>
                    </div>

                    {/* Transcript */}
                    <p className="text-foreground mb-4 leading-relaxed">
                      {incident.transcript}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {incident.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>Location recorded</span>
                        </div>
                      )}
                      
                      {incident.peopleInvolved.length > 0 && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{incident.peopleInvolved.join(', ')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span>Severity: {incident.severity}/5</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIncident(incident.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Timeline connector */}
                {index < filteredIncidents.length - 1 && (
                  <div className="absolute left-8 bottom-0 w-px h-4 bg-border"></div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No incidents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || severityFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Start documenting incidents to build your timeline.'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && severityFilter === 'all' && (
                <Button asChild>
                  <a href="/record">Record First Incident</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}