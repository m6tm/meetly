
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your meetings today.</p>
        </div>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Recent Recordings</CardTitle>
          <CardDescription>Quickly access your latest meeting recordings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Marketing Strategy Q3", date: "Yesterday", duration: "45 min", thumbnail: "https://placehold.co/600x400.png", hint: "business team" },
              { title: "Dev Team Standup", date: "2 days ago", duration: "15 min", thumbnail: "https://placehold.co/600x400.png", hint: "code screen" },
              { title: "Client Onboarding Call", date: "July 15, 2024", duration: "60 min", thumbnail: "https://placehold.co/600x400.png", hint: "presentation slide" },
            ].map((rec, index) => (
              <div key={index} className="border rounded-lg overflow-hidden group">
                <div className="aspect-video bg-muted overflow-hidden">
                   <Image src={rec.thumbnail} alt={rec.title} width={600} height={400} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" data-ai-hint={rec.hint} />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground">{rec.date} &bull; {rec.duration}</p>
                  <Button variant="link" size="sm" className="px-0 mt-1">Watch Recording</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
