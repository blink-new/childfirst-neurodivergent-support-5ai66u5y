import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Scale, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  ExternalLink,
  Gavel,
  Shield,
  Users,
  Calendar
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

const legalContacts = [
  {
    name: 'Victoria Legal Aid',
    description: 'Free legal advice and representation for eligible families',
    phone: '1300 792 387',
    website: 'https://www.legalaid.vic.gov.au',
    services: ['Family law', 'Child protection', 'Disability rights', 'Education law']
  },
  {
    name: 'Disability Advocacy Victoria',
    description: 'Advocacy services for people with disabilities and their families',
    phone: '1300 365 085',
    website: 'https://www.disabilityadvocacyvic.org.au',
    services: ['Individual advocacy', 'Systemic advocacy', 'Legal support']
  },
  {
    name: 'Children\'s Legal Service',
    description: 'Specialized legal services for children and young people',
    phone: '(03) 9620 3733',
    website: 'https://www.cls.org.au',
    services: ['Child protection', 'Family law', 'Education disputes']
  },
  {
    name: 'Autism Advocacy Australia',
    description: 'Legal advocacy specifically for autism-related issues',
    phone: '0499 133 399',
    website: 'https://www.autismadvocacyaustralia.com.au',
    services: ['Education advocacy', 'NDIS appeals', 'Discrimination cases']
  }
];

const documentationChecklist = [
  {
    category: 'Medical Documentation',
    items: [
      'Formal diagnosis reports from qualified professionals',
      'Assessment reports (psychological, occupational therapy, speech therapy)',
      'Medical records showing ongoing treatment and support needs',
      'Medication records and effects documentation',
      'Therapy session notes and progress reports'
    ]
  },
  {
    category: 'Educational Records',
    items: [
      'School reports and academic assessments',
      'Individual Education Plans (IEPs) or Student Support Group meeting notes',
      'Correspondence with school staff about accommodations',
      'Suspension or disciplinary records',
      'Evidence of school refusal or attendance issues'
    ]
  },
  {
    category: 'Incident Documentation',
    items: [
      'Detailed incident reports with dates, times, and locations',
      'Photos or videos of injuries or property damage (if applicable)',
      'Witness statements from family members, teachers, or others',
      'Police reports (if applicable)',
      'Your ChildFirst incident timeline and reports'
    ]
  },
  {
    category: 'Communication Records',
    items: [
      'Email correspondence with schools, services, or other parties',
      'Text messages or written communications',
      'Meeting notes and minutes',
      'Phone call logs with dates and summaries',
      'Letters from professionals or advocates'
    ]
  }
];

const victorianLaws = [
  {
    title: 'Disability Discrimination Act 1992 (Commonwealth)',
    description: 'Protects against discrimination based on disability in education, employment, and services',
    keyPoints: [
      'Schools must make reasonable adjustments for students with disabilities',
      'Discrimination includes direct, indirect, and failure to make reasonable adjustments',
      'Complaints can be made to the Australian Human Rights Commission'
    ]
  },
  {
    title: 'Education and Training Reform Act 2006 (Victoria)',
    description: 'Governs education in Victoria, including rights of students with disabilities',
    keyPoints: [
      'Every child has the right to education',
      'Schools must provide appropriate support for students with disabilities',
      'Parents have the right to be involved in educational decisions'
    ]
  },
  {
    title: 'Family Law Act 1975 (Commonwealth)',
    description: 'Governs family law matters including custody and care arrangements',
    keyPoints: [
      'Best interests of the child is the paramount consideration',
      'Child\'s disability and support needs are relevant factors',
      'Courts consider the child\'s views (if age-appropriate)'
    ]
  },
  {
    title: 'Children, Youth and Families Act 2005 (Victoria)',
    description: 'Protects children and governs child protection services',
    keyPoints: [
      'Child\'s safety and wellbeing is paramount',
      'Services must consider cultural and disability needs',
      'Parents have rights to participate in decisions affecting their child'
    ]
  }
];

export default function LegalTools() {
  const [reportData, setReportData] = useState({
    childName: '',
    dateOfBirth: '',
    diagnosis: '',
    reportPurpose: '',
    additionalNotes: ''
  });
  const { toast } = useToast();

  const generateCourtReport = async () => {
    try {
      const incidents = JSON.parse(localStorage.getItem('childfirst_incidents') || '[]') as Incident[];
      
      if (incidents.length === 0) {
        toast({
          title: "No incidents found",
          description: "Please record some incidents before generating a report.",
          variant: "destructive",
        });
        return;
      }

      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text('COURT DOCUMENTATION REPORT', 20, 20);
      doc.text('ChildFirst - Neurodivergent Child Support', 20, 30);
      
      // Child Information
      doc.setFontSize(12);
      doc.text('CHILD INFORMATION', 20, 50);
      doc.setFontSize(10);
      doc.text(`Name: ${reportData.childName || '[Child Name]'}`, 25, 60);
      doc.text(`Date of Birth: ${reportData.dateOfBirth || '[Date of Birth]'}`, 25, 70);
      doc.text(`Diagnosis: ${reportData.diagnosis || '[Diagnosis]'}`, 25, 80);
      doc.text(`Report Purpose: ${reportData.reportPurpose || '[Report Purpose]'}`, 25, 90);
      doc.text(`Generated: ${format(new Date(), 'PPP')}`, 25, 100);
      
      // Summary Statistics
      doc.setFontSize(12);
      doc.text('INCIDENT SUMMARY', 20, 120);
      doc.setFontSize(10);
      doc.text(`Total Incidents Recorded: ${incidents.length}`, 25, 130);
      
      const severityCount = incidents.reduce((acc, incident) => {
        const level = incident.severity <= 2 ? 'Low' : incident.severity <= 3 ? 'Medium' : 'High';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      doc.text(`Severity Breakdown: Low: ${severityCount.Low || 0}, Medium: ${severityCount.Medium || 0}, High: ${severityCount.High || 0}`, 25, 140);
      
      const categoryCount = incidents.reduce((acc, incident) => {
        acc[incident.category] = (acc[incident.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostCommon = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0];
      doc.text(`Most Common Category: ${mostCommon ? `${mostCommon[0]} (${mostCommon[1]} incidents)` : 'N/A'}`, 25, 150);
      
      // Detailed Incidents
      let yPosition = 170;
      doc.setFontSize(12);
      doc.text('DETAILED INCIDENT REPORTS', 20, yPosition);
      yPosition += 20;
      
      incidents.slice(0, 10).forEach((incident, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.text(`${index + 1}. ${incident.category} - Severity: ${incident.severity}/5`, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(9);
        doc.text(`Date: ${format(parseISO(incident.timestamp), 'PPpp')}`, 25, yPosition);
        yPosition += 7;
        
        if (incident.location) {
          doc.text(`Location: GPS coordinates recorded`, 25, yPosition);
          yPosition += 7;
        }
        
        if (incident.peopleInvolved.length > 0) {
          doc.text(`People Involved: ${incident.peopleInvolved.join(', ')}`, 25, yPosition);
          yPosition += 7;
        }
        
        // Transcript
        const splitText = doc.splitTextToSize(incident.transcript, 160);
        doc.text('Description:', 25, yPosition);
        yPosition += 7;
        doc.text(splitText, 25, yPosition);
        yPosition += splitText.length * 4 + 10;
      });
      
      // Additional Notes
      if (reportData.additionalNotes) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.text('ADDITIONAL NOTES', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(10);
        const additionalText = doc.splitTextToSize(reportData.additionalNotes, 160);
        doc.text(additionalText, 25, yPosition);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.text('This report was generated by ChildFirst app for legal documentation purposes.', 20, 280);
      doc.text('All data is stored locally on the device for privacy protection.', 20, 285);
      
      doc.save(`childfirst-court-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Report generated successfully",
        description: "Court documentation report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Report generation failed",
        description: "Unable to generate court report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Legal Tools</h1>
        <p className="text-muted-foreground">
          Documentation and resources for legal proceedings and advocacy
        </p>
      </div>

      <Tabs defaultValue="report" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="report">Court Report</TabsTrigger>
          <TabsTrigger value="checklist">Documentation</TabsTrigger>
          <TabsTrigger value="laws">Victorian Laws</TabsTrigger>
          <TabsTrigger value="contacts">Legal Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Generate Court Documentation Report</span>
              </CardTitle>
              <CardDescription>
                Create a comprehensive report of all recorded incidents for legal proceedings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Child's Name</label>
                  <Input
                    placeholder="Enter child's name"
                    value={reportData.childName}
                    onChange={(e) => setReportData(prev => ({ ...prev, childName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date of Birth</label>
                  <Input
                    type="date"
                    value={reportData.dateOfBirth}
                    onChange={(e) => setReportData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Diagnosis/Condition</label>
                  <Input
                    placeholder="e.g., Autism Spectrum Disorder, ADHD"
                    value={reportData.diagnosis}
                    onChange={(e) => setReportData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Purpose</label>
                  <Input
                    placeholder="e.g., Family Court proceedings, School tribunal"
                    value={reportData.reportPurpose}
                    onChange={(e) => setReportData(prev => ({ ...prev, reportPurpose: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                <Textarea
                  placeholder="Any additional context or information relevant to the case..."
                  value={reportData.additionalNotes}
                  onChange={(e) => setReportData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-center pt-4">
                <Button onClick={generateCourtReport} className="bg-success hover:bg-success/90 text-success-foreground">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Court Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Report Will Include:</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Child information and diagnosis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Incident summary statistics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Detailed incident chronology</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">GPS location data (where available)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">People involved in incidents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm">Professional formatting for court use</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Legal Documentation Checklist</span>
              </CardTitle>
              <CardDescription>
                Essential documents to gather for legal proceedings or advocacy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {documentationChecklist.map((section, index) => (
                  <div key={index}>
                    <h3 className="font-semibold text-lg mb-3 text-primary">{section.category}</h3>
                    <div className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-accent">
                <AlertTriangle className="w-5 h-5" />
                <span>Important Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Keep original documents safe and provide copies to legal representatives</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Organize documents chronologically for easier review</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Include witness contact information where relevant</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Your ChildFirst incident reports provide valuable chronological documentation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laws" className="space-y-6">
          <div className="space-y-4">
            {victorianLaws.map((law, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    <span>{law.title}</span>
                  </CardTitle>
                  <CardDescription>{law.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Key Points:</h4>
                  <ul className="space-y-2">
                    {law.keyPoints.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start space-x-3">
                        <Scale className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-primary">
                <Shield className="w-5 h-5" />
                <span>Legal Disclaimer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This information is provided for educational purposes only and does not constitute legal advice. 
                Laws and regulations may change, and individual circumstances vary. Always consult with a qualified 
                legal professional for advice specific to your situation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Legal Support Contacts</span>
              </CardTitle>
              <CardDescription>
                Organizations providing legal assistance for families of neurodivergent children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {legalContacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{contact.name}</h3>
                    <p className="text-muted-foreground mb-3">{contact.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {contact.services.map((service, serviceIndex) => (
                        <Badge key={serviceIndex} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <Calendar className="w-5 h-5" />
                <span>Urgent Legal Assistance</span>
              </CardTitle>
              <CardDescription>
                For urgent legal matters requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Victoria Legal Aid Emergency</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    24/7 legal advice for urgent family law matters
                  </p>
                  <Button variant="destructive" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 1800 677 402
                  </Button>
                </div>
                
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-2">Child Protection Crisis</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Immediate assistance for child protection matters
                  </p>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call 1800 075 599
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}