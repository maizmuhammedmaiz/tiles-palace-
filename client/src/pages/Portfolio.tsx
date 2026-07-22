import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { api } from "@shared/routes";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";

const Player = ReactPlayer as any;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Portfolio() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: [api.services.list.path],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">Our Service Portfolio</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our completed projects and witness the quality of Tiles Palace craftsmanship.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services?.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden hover-elevate h-full">
                    <div className="aspect-video bg-black relative">
                      {service.type === "video" && service.videoUrl ? (
                        <Player
                          url={service.videoUrl}
                          width="100%"
                          height="100%"
                          controls
                        />
                      ) : (
                        <img
                          src={service.imageUrl || ""}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="font-display">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
