import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { InquiryDialog } from "@/components/InquiryDialog";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-slate-900 text-white py-20">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Have a question about our products or need a consultation? We're here to help you build your dream space.
          </p>
        </div>
      </div>
      
      <div className="container px-4 py-16 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-none shadow-md bg-slate-50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Visit Showroom</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    123 Design Avenue<br />
                    Interior City, IC 90210
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-slate-50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Call Us</h3>
                  <p className="text-muted-foreground text-sm">
                    +1 (555) 123-4567
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mon-Fri, 9am - 6pm EST
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-slate-50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email Us</h3>
                  <p className="text-muted-foreground text-sm">
                    contact@luxefittings.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We reply within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-md bg-slate-50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Opening Hours</h3>
                  <p className="text-muted-foreground text-sm">
                    Mon - Fri: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Contact Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border shadow-sm">
              <h2 className="text-2xl font-display font-bold mb-2">Send us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form and our team will get back to you shortly.
              </p>
              
              {/* Reuse Inquiry Dialog Form Logic by creating a wrapper or just direct usage */}
              {/* For simplicity in this generated code, I'll use the InquiryDialog which contains the form logic */}
              <div className="bg-slate-50 p-8 rounded-xl text-center border border-dashed border-slate-300">
                <p className="mb-6 font-medium text-slate-600">
                  Ready to start your project? Click below to open our inquiry form.
                </p>
                <InquiryDialog />
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="bg-slate-100 rounded-2xl h-[300px] w-full flex items-center justify-center border text-slate-400">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Interactive Map Would Load Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
