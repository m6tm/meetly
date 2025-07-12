
'use client';

import React, { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MoreHorizontal, PlayCircle, FileText, Trash2, Loader2, AlertTriangle,
  CheckCircle, Clock, Play, Pause, Volume1, Volume2, VolumeX, Undo2, Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { format, parseISO, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { deleteRecordingAction, fetchRecordingsAction, getRecordingUrlAction, restoreRecordingAction } from '@/actions/meetly-manager';
import { formatToHumanReadable } from '@/lib/meetly-tools';
import { startTranscriptionAction } from '@/actions/meetly-meet-manager';
import { useRealtimeUpdates } from '@/hooks/use-realtime-update';
import { useRouter } from 'next/navigation';
import { generateDownloadUrl } from '@/actions/s3-actions';

// Define the RecordedMeeting type
export type RecordedMeeting = {
  id: string;
  title: string;
  date: string; // ISO string for data, format for display
  time: string; // HH:mm
  filepath?: string;
  duration: string; // e.g., "45 min" - this refers to meeting duration, not audio length
  recordingStatus: 'Recorded' | 'Transcription Pending' | 'Transcribed' | 'Transcription Failed' | 'Pending Deletion' | 'Transcription In Progress';
  audioUrl?: string;
  previousStatus?: RecordedMeeting['recordingStatus']; // To store status before 'Pending Deletion'
};

export default function RecordingsPage() {
  const [recordings, setRecordings] = React.useState<RecordedMeeting[]>([]);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | RecordedMeeting['recordingStatus']>('all');
  const { toast } = useToast();
  const router = useRouter();

  const [isPlayerModalOpen, setIsPlayerModalOpen] = React.useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = React.useState<string | undefined>(undefined);
  const [currentAudioTitle, setCurrentAudioTitle] = React.useState<string>('');

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(0);
  const [tooltipTime, setTooltipTime] = React.useState<number | null>(null);
  const [isProgressBarHovered, setIsProgressBarHovered] = React.useState(false);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = React.useState(false);
  const [recordingToDelete, setRecordingToDelete] = React.useState<RecordedMeeting | null>(null);
  const [isPermanentDeleteChecked, setIsPermanentDeleteChecked] = React.useState(false);
  const [loading, setLoading] = useState(true)
  const [generatingMedialink, setGeneratingMediaLink] = useState('')

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleFetchRecordings = React.useCallback(async () => {
    setLoading(true)
    const response = await fetchRecordingsAction();
    if (response.success && response.data) {
      const formattedRecordings = response.data.recordings.map(rec => {
        let recordingStatus: RecordedMeeting['recordingStatus'];

        if (rec.transcription_status === 'TRANSCRIPTION_PENDING') {
          recordingStatus = 'Transcription Pending';
        } else if (rec.transcription_status === 'TRANSCRIPTION_IN_PROGRESS') {
          recordingStatus = 'Transcription In Progress';
        } else if (rec.transcription_status === 'TRANSCRIPTION_COMPLETED') {
          recordingStatus = 'Transcribed';
        } else if (rec.transcription_status === 'TRANSCRIPTION_FAILLED') {
          recordingStatus = 'Transcription Failed';
        } else {
          recordingStatus = 'Recorded';
        }

        if (rec.deleted) {
          recordingStatus = 'Pending Deletion';
        }

        return {
          id: rec.id,
          title: rec.meeting.name,
          date: rec.recordDate.toISOString(),
          time: format(rec.recordDate, 'HH:mm'),
          filepath: rec.meetingRecordingPath?.filepath,
          duration: formatToHumanReadable(Number(rec.meetingRecordingPath!.duration)),
          recordingStatus: recordingStatus,
          audioUrl: undefined,
          previousStatus: undefined,
        };
      });
      setRecordings(formattedRecordings);
    } else if (!response.success) {
      toast({ title: "Error fetching recordings", description: response.error, variant: "destructive" });
    }
    setLoading(false)
  }, [setRecordings, toast]);

  useRealtimeUpdates({
    channel: 'meeting-recording',
    table: 'meeting_recording',
    schema: 'meeting',
    event: 'UPDATE',
    callback: (payload) => {
      handleFetchRecordings();
    },
  }, []);

  React.useEffect(() => {
    handleFetchRecordings();
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    // Ensure audio element and URL are available and modal is open
    if (!audio || !currentAudioUrl || !isPlayerModalOpen) {
      return;
    }

    const updatePlayState = () => setIsPlaying(!audio.paused);
    const updateVolumeState = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration);
      if (audio.duration > 0) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleAudioEnded = () => setIsPlaying(false);

    audio.addEventListener('play', updatePlayState);
    audio.addEventListener('pause', updatePlayState);
    audio.addEventListener('volumechange', updateVolumeState);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleAudioEnded);

    updatePlayState();
    updateVolumeState();
    if (audio.readyState >= audio.HAVE_METADATA) {
      handleLoadedMetadata();
    }

    return () => {
      audio.removeEventListener('play', updatePlayState);
      audio.removeEventListener('pause', updatePlayState);
      audio.removeEventListener('volumechange', updateVolumeState);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleAudioEnded);
    };
  }, [isPlayerModalOpen, currentAudioUrl, audioRef.current]);

  const handleOpenPlayerModal = (open: boolean) => {
    if (!open && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    setIsPlayerModalOpen(open);
  };

  const handlePlayAudio = async (recording: RecordedMeeting) => {
    if (!recording.filepath) return
    setGeneratingMediaLink(recording.id)
    try {
      const { success, data, error } = !recording.audioUrl ? await getRecordingUrlAction(recording.filepath) : {
        success: true,
        data: recording.audioUrl,
        error: null
      }
      if (!success || !data) {
        toast({ title: "Getting media url failled", description: error, variant: "destructive" })
        return
      }

      setRecordings(prevRecordings =>
        prevRecordings.map(rec =>
          rec.id === recording.id ? { ...rec, audioUrl: data } : rec
        )
      );

      if (data) {
        setCurrentAudioUrl(data);
        setCurrentAudioTitle(recording.title);
        setIsPlaying(false);
        setCurrentTime(0);
        setAudioDuration(0);
        handleOpenPlayerModal(true);
      } else {
        toast({ title: "Audio Not Available", description: `No audio URL found for recording: ${recording.title}`, variant: "destructive" });
      }
    } finally {
      setGeneratingMediaLink('')
    }
  };

  const handlePlayPauseToggle = async () => {
    if (audioRef.current) {
      if (audioRef.current.paused || audioRef.current.ended) {
        await audioRef.current.play().catch(err => console.error("Error playing audio:", err));
        if (!audioRef.current.paused) setIsPlaying(true);
      } else {
        audioRef.current.pause();
        if (audioRef.current.paused) setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      audioRef.current.volume = clampedVolume;
      if (audioRef.current.muted && clampedVolume > 0) {
        audioRef.current.muted = false;
      }
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && audioDuration > 0) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressBarHover = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioDuration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const hoverRatio = Math.min(1, Math.max(0, x / width));
      setTooltipTime(hoverRatio * audioDuration);
      setIsProgressBarHovered(true);
    }
  };

  const handleProgressBarLeave = () => {
    setIsProgressBarHovered(false);
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioDuration > 0 && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const clickRatio = Math.min(1, Math.max(0, x / width));
      const newTime = clickRatio * audioDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleStartTranscription = async (recordingId: string, recordingTitle: string) => {
    const response = await startTranscriptionAction(recordingId)
    if (!response.success) {
      toast({ title: "Error starting transcription", description: response.error, variant: "destructive" });
      return
    }
    setRecordings(prev =>
      prev.map(rec => rec.id === recordingId ? { ...rec, recordingStatus: 'Transcription Pending' } : rec)
    );
    toast({ title: "Transcription Started", description: `Transcription process initiated for recording: ${recordingTitle}` });
  };

  const handleDeleteRecordingClick = (recording: RecordedMeeting) => {
    setRecordingToDelete(recording);
    setIsPermanentDeleteChecked(false);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteRecording = async () => {
    if (!recordingToDelete) return;

    const response = await deleteRecordingAction(recordingToDelete.id, isPermanentDeleteChecked)
    if (!response.success) {
      toast({ title: "Error deleting recording", description: response.error, variant: "destructive" });
      return
    }

    if (isPermanentDeleteChecked) {
      setRecordings(prev => prev.filter(rec => rec.id !== recordingToDelete.id));
      toast({ title: "Recording Permanently Deleted", description: `"${recordingToDelete.title}" has been removed.`, variant: "destructive" });
    } else {
      setRecordings(prev =>
        prev.map(rec =>
          rec.id === recordingToDelete.id
            ? { ...rec, recordingStatus: 'Pending Deletion', previousStatus: rec.recordingStatus }
            : rec
        )
      );
      toast({ title: "Recording Marked for Deletion", description: `"${recordingToDelete.title}" will be permanently removed in 30 days. You can restore it.` });
    }
    setRecordingToDelete(null);
    setIsDeleteConfirmModalOpen(false);
  };

  const handleUndoDelete = async (recordingId: string) => {
    const response = await restoreRecordingAction(recordingId)
    if (!response.success) {
      toast({ title: "Error restoring", description: response.error, variant: "destructive" })
      return
    }
    handleFetchRecordings()
    toast({ title: "Recording Restored", description: `The recording has been restored.` });
  };

  const columns: ColumnDef<RecordedMeeting>[] = React.useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const dateString = row.getValue('date') as string;
          try {
            if (!dateString) return "N/A";
            return format(parseISO(dateString), 'do, MMMM yyyy');
          } catch (e) {
            return dateString;
          }
        },
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => {
          const timeString = row.getValue('time') as string;
          if (!timeString) return "N/A";
          try {
            const referenceDate = new Date(2000, 0, 1);
            const parsedTime = parse(timeString, 'HH:mm', referenceDate);
            return format(parsedTime, 'h:mm a');
          } catch (e) {
            return timeString;
          }
        }
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
      },
      {
        accessorKey: 'recordingStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('recordingStatus') as RecordedMeeting['recordingStatus'];
          let icon = null;
          let badgeClasses = "";

          switch (status) {
            case 'Recorded':
              icon = <PlayCircle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-700/40';
              break;
            case 'Transcription Pending':
              icon = <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-700/40';
              break;
            case 'Transcription In Progress':
              icon = <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />;
              badgeClasses = 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-700/40';
              break;
            case 'Transcribed':
              icon = <CheckCircle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-700/30 dark:text-green-300 dark:border-green-700/40';
              break;
            case 'Transcription Failed':
              icon = <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-700/30 dark:text-red-300 dark:border-red-700/40';
              break;
            case 'Pending Deletion':
              icon = <Info className="mr-1.5 h-3.5 w-3.5" />;
              badgeClasses = 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30 dark:bg-orange-700/30 dark:text-orange-300 dark:border-orange-700/40';
              break;
            default:
              icon = <Clock className="mr-1.5 h-3.5 w-3.5" />
          }
          return (
            <Badge variant="outline" className={badgeClasses}>
              {icon}
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const recording = row.original;
          if (recording.recordingStatus === 'Pending Deletion') {
            return (
              <div className="text-right whitespace-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUndoDelete(recording.id)}
                >
                  <Undo2 className="mr-1 h-4 w-4" />
                  Restore
                </Button>
              </div>
            );
          }
          return (
            <div className="text-right whitespace-nowrap">
              {recording.filepath && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  onClick={() => handlePlayAudio(recording)}
                  disabled={(!recording.filepath && recording.recordingStatus !== 'Transcription Pending') || generatingMedialink === recording.id}
                >
                  {generatingMedialink === recording.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-1 h-4 w-4" />}
                  Play
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(recording.recordingStatus === 'Recorded' || recording.recordingStatus === 'Transcription Failed' || recording.recordingStatus === 'Transcription Pending') && (
                    <DropdownMenuItem onClick={() => handleStartTranscription(recording.id, recording.title)}>
                      <FileText className="mr-2 h-4 w-4" />
                      {recording.recordingStatus === 'Transcription Failed' ? 'Retry Transcription' : 'Start Transcription'}
                    </DropdownMenuItem>
                  )}
                  {recording.recordingStatus === 'Transcribed' && (
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/transcriptions/?rec=${recording.id}`)}>
                      <FileText className="mr-2 h-4 w-4" /> View Transcription
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteRecordingClick(recording)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Recording
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generatingMedialink]
  );

  const filteredRecordings = React.useMemo(() => {
    return recordings
      .filter(rec =>
        titleFilter ? rec.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      )
      .filter(rec =>
        statusFilter !== 'all' ? rec.recordingStatus === statusFilter : true
      );
  }, [recordings, titleFilter, statusFilter]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Meeting Recordings
        </h1>
        <p className="text-muted-foreground">
          Access and manage your recorded meetings and their transcriptions.
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recording List</CardTitle>
          <CardDescription>
            Overview of all your meeting recordings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-2 py-4">
            <Input
              placeholder="Filter by title..."
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
              className="max-w-xs w-full sm:w-auto"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | RecordedMeeting['recordingStatus'])}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Recorded">Recorded</SelectItem>
                <SelectItem value="Transcription Pending">Transcription Pending</SelectItem>
                <SelectItem value="Transcribed">Transcribed</SelectItem>
                <SelectItem value="Transcription Failed">Transcription Failed</SelectItem>
                <SelectItem value="Pending Deletion">Pending Deletion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredRecordings} initialPageSize={5} loading={loading} />
        </CardContent>
      </Card>

      <Dialog open={isPlayerModalOpen} onOpenChange={handleOpenPlayerModal}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center">
              <PlayCircle className="mr-2 h-6 w-6 text-primary" />
              Playing: {currentAudioTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-muted/30">
            {currentAudioUrl ? (
              <audio
                ref={audioRef}
                src={currentAudioUrl}
                className="w-full aspect-audio rounded-md shadow-md bg-black cursor-pointer"
                onClick={handlePlayPauseToggle}
                onLoadedMetadata={() => {
                  if (audioRef.current) {
                    setVolume(audioRef.current.volume);
                    setIsMuted(audioRef.current.muted);
                    setAudioDuration(audioRef.current.duration);
                  }
                }}
              >
                Your browser does not support the audio tag.
              </audio>
            ) : (
              <p className="text-muted-foreground text-center py-10">No audio to display.</p>
            )}
            {currentAudioUrl && (
              <>
                <div className="flex items-center gap-2 px-1 mt-2 w-full">
                  <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip open={isProgressBarHovered && tooltipTime !== null && audioDuration > 0}>
                      <TooltipTrigger asChild>
                        <div
                          ref={progressBarRef}
                          className="relative flex-grow h-6 flex items-center cursor-pointer group"
                          onMouseMove={handleProgressBarHover}
                          onMouseLeave={handleProgressBarLeave}
                          onClick={handleProgressBarClick}
                        >
                          <Slider
                            value={audioDuration > 0 ? [currentTime] : [0]}
                            max={audioDuration > 0 ? audioDuration : 1}
                            step={0.1}
                            onValueChange={handleSeek}
                            className={cn(
                              "w-full absolute top-1/2 -translate-y-1/2",
                              "[&>span:first-of-type]:h-2",
                              "[&>button]:h-4 [&>button]:w-4 [&>button]:border-2"
                            )}
                            aria-label="Audio progress"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="bg-black/80 text-white py-1 px-2 rounded text-xs">
                        <p>{tooltipTime !== null ? formatTime(tooltipTime) : '00:00'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
                    {formatTime(audioDuration)}
                  </span>
                </div>

                <div className="mt-3 p-3 bg-background/70 rounded-md shadow flex items-center justify-between space-x-2">
                  <Button variant="ghost" size="icon" onClick={handlePlayPauseToggle} aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>

                  <div className="flex items-center space-x-1 flex-grow justify-center">
                    <Button variant="ghost" size="icon" onClick={handleToggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                      {isMuted ? <VolumeX className="h-5 w-5" /> : (volume > 0.5 ? <Volume2 className="h-5 w-5" /> : <Volume1 className="h-5 w-5" />)}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleVolumeChange(Math.max(0, volume - 0.1))} aria-label="Volume Down" disabled={isMuted || volume <= 0}>
                      <Volume1 className="h-5 w-5" />
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-16 sm:w-24 h-2 bg-muted-foreground rounded-lg appearance-none cursor-pointer accent-primary mx-2"
                      aria-label="Volume slider"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleVolumeChange(Math.min(1, volume + 0.1))} aria-label="Volume Up" disabled={isMuted || volume >= 1}>
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="w-10"></div> {/* Spacer to balance play/pause button */}
                </div>
              </>
            )}
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => handleOpenPlayerModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {recordingToDelete && (
        <AlertDialog open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{recordingToDelete.title}"?
                <br /><br />
                If not deleted permanently, this recording will be marked for deletion and removed in 30 days. You can restore it during this period.
                <br />
                If you choose to delete permanently, this action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center space-x-2 my-4">
              <Checkbox
                id="permanent-delete"
                checked={isPermanentDeleteChecked}
                onCheckedChange={(checked) => setIsPermanentDeleteChecked(checked as boolean)}
              />
              <Label htmlFor="permanent-delete" className="text-sm font-medium">
                Supprimer définitivement
              </Label>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRecordingToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteRecording} className={cn(isPermanentDeleteChecked && "bg-destructive hover:bg-destructive/90")}>
                {isPermanentDeleteChecked ? "Delete Permanently" : "Confirm Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
