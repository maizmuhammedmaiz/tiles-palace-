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
                    Ayanikkad, Payyoli, Iringal<br />
                    Kerala 673522
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
                    contact@tilespalace.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We reply within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-green-50">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-green-600">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">WhatsApp</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Message us for quick support.
                  </p>
                  <a 
                    href="https://wa.me/15551234567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 font-bold hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
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
                  <div className="text-muted-foreground text-sm space-y-1">
                    <p>Saturday 9:30 am–7:30 pm</p>
                    <p>Sunday Closed</p>
                    <p>Monday 9:30 am–7:30 pm</p>
                    <p>Tuesday 9:30 am–7:30 pm</p>
                    <p>Wednesday 9:30 am–7:30 pm</p>
                    <p>Thursday 9:30 am–7:30 pm</p>
                    <p>Friday 9:30 am–7:30 pm</p>
                  </div>
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
            
            {/* Google Maps Embed */}
            <div className="bg-slate-100 rounded-2xl h-[400px] w-full overflow-hidden border shadow-sm">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.2233913120413!2d77.0592!3d28.5323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDMxJzU2LjMiTiA3N8KwMDMnMzMuMSJF!5e0!3m2!1sen!2sin!4v1625567890123!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tiles Palace Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
