import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

const personas = [
  {
    name: "Brendon Burchard",
    title: "3-time NYT bestselling author",
    image: "/placeholder.jpg",
    href: "/personas/brendon",
  },
  {
    name: "Ben Greenfield",
    title: "Founder, Ben Greenfield Life",
    image: "/placeholder.jpg",
    href: "/personas/ben",
  },
  {
    name: "Heather Monahan",
    title: "The Confidence Creator",
    image: "/placeholder.jpg",
    href: "/personas/heather",
  },
  {
    name: "Matthew Hussey",
    title: "Your Personal 24/7 Love Life Coach",
    image: "/placeholder.jpg",
    href: "/personas/matthew",
  },
  {
    name: "Tiago Forte",
    title: "Founder of Forte Labs",
    image: "/placeholder.jpg",
    href: "/personas/tiago",
  },
  {
    name: "Keith Rabois",
    title: "Managing Director at Khosla Ventures",
    image: "/placeholder.jpg",
    href: "/personas/keith",
  },
];

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section>
        <h2 className="text-2xl font-bold mb-6">Explore Personas</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-20">
          {personas.map((persona) => (
            <div key={persona.name} className="flex flex-col items-center">
              <Link href={persona.href} className="w-full">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group relative">
                  <CardContent className="p-0">
                    <Image
                      src={persona.image}
                      alt={persona.name}
                      width={200}
                      height={200}
                      className="w-full h-[200px] object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white flex items-center gap-2 bg-gray-700 bg-opacity-75 rounded-full px-4 py-2">
                        <MessageCircle size={20} />
                        Talk
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <div className="mt-2 text-center">
                <h3 className="font-semibold text-sm">{persona.name}</h3>
                <p className="text-muted-foreground text-xs">{persona.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
