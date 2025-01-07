"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Headphones, Shield, Phone } from "lucide-react";
import { use } from "react";

type PersonaPageProps = {
  slug: string;
};

export default function PersonaPage({
  params,
}: {
  params: Promise<PersonaPageProps>;
}) {
  let { slug } = use(params);
  slug = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[400px_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="relative">
            <Image
              src="/placeholder.jpg"
              alt="Profile"
              width={400}
              height={400}
              className="rounded-2xl w-full object-cover aspect-square"
            />
            <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-1 shadow-lg">
              <span className="font-medium text-sm">AI</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{slug}</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ducimus,
              soluta necessitatibus vel doloribus iusto impedit minima, debitis
              qui quae voluptatum molestiae autem nemo totam beatae animi
              possimus id unde porro?
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Action Cards */}
          <div className="grid gap-4">
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <Headphones className="text-primary h-5 w-5" />
                <div>
                  <h3 className="font-medium">Listen to {slug}&apos;s Full Call</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <Phone className="text-primary h-5 w-5" />
                <div>
                  <h3 className="font-medium">Talk to {slug}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <Phone className="text-primary h-5 w-5" />
                <div>
                  <h3 className="font-medium">Chat with {slug}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <Shield className="text-primary h-5 w-5" />
                <div>
                  <h3 className="font-medium">Review {slug}&apos;s Safety Data</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
