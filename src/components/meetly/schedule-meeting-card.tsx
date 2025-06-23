"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus } from "lucide-react";
import React from "react";
import ScheduleMeetingModal from "./schedule-modal";

const ScheduleMeetingCard = () => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-2">
          <CalendarPlus className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Plan Ahead</CardTitle>
        </div>
        <CardDescription>Schedule meetings and manage invitations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScheduleMeetingModal />
        <p className="text-sm text-muted-foreground">
          Set recurring meetings, send email invites, and secure with access codes.
        </p>
      </CardContent>
    </Card>
  );
};

export default ScheduleMeetingCard;
