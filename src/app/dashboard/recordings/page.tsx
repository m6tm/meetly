
'use client';

import React from 'react';
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
  DialogDescription,
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
  AlertDialogTrigger,
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

// Define the RecordedMeeting type
export type RecordedMeeting = {
  id: string;
  title: string;
  date: string; // ISO string for data, format for display
  time: string; // HH:mm
  duration: string; // e.g., "45 min" - this refers to meeting duration, not video length
  recordingStatus: 'Recorded' | 'Transcription Pending' | 'Transcribed' | 'Transcription Failed' | 'Pending Deletion';
  videoUrl?: string;
  previousStatus?: RecordedMeeting['recordingStatus']; // To store status before 'Pending Deletion'
};

// Placeholder data for recorded meetings
const initialRecordingsData: RecordedMeeting[] = [
  {
    id: 'rec1',
    title: 'Quarterly Business Review Q3',
    date: '2024-08-10T00:00:00.000Z',
    time: '14:00',
    duration: '1h 32min',
    recordingStatus: 'Transcribed',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4', 
  },
  {
    id: 'rec2',
    title: 'Product Strategy Session',
    date: '2024-08-12T00:00:00.000Z',
    time: '10:30',
    duration: '58min',
    recordingStatus: 'Recorded',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4',
  },
  {
    id: 'rec3',
    title: 'Engineering Standup - Sprint Planning',
    date: '2024-08-15T00:00:00.000Z',
    time: '09:00',
    duration: '25min',
    recordingStatus: 'Transcription Pending',
  },
  {
    id: 'rec4',
    title: 'Client Call - Acme Corp Follow-up',
    date: '2024-08-16T00:00:00.000Z',
    time: '11:00',
    duration: '45min',
    recordingStatus: 'Transcription Failed',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4',
  },
  {
    id: 'rec5',
    title: 'Marketing Campaign Brainstorm',
    date: '2024-08-18T00:00:00.000Z',
    time: '15:00',
    duration: '1h 15min',
    recordingStatus: 'Recorded',
  },
  {
    id: 'rec6',
    title: 'Old Financial Report',
    date: '2024-07-01T00:00:00.000Z',
    time: '10:00',
    duration: '30min',
    recordingStatus: 'Pending Deletion',
    videoUrl: 'https://placehold.co/static/videos/video-placeholder.mp4',
    previousStatus: 'Transcribed',
  }
];

export default function RecordingsPage() {
  const [recordings, setRecordings] = React.useState<RecordedMeeting[]>(initialRecordingsData);
  const [titleFilter, setTitleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | RecordedMeeting['recordingStatus']>('all');
  const { toast } = useToast();

  const [isPlayerModalOpen, setIsPlayerModalOpen] = React.useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = React.useState<string | undefined>(undefined);
  const [currentVideoTitle, setCurrentVideoTitle] = React.useState<string>('');

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [videoDuration, setVideoDuration] = React.useState(0);
  const [tooltipTime, setTooltipTime] = React.useState<number | null>(null);
  const [isProgressBarHovered, setIsProgressBarHovered] = React.useState(false);

  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = React.useState(false);
  const [recordingToDelete, setRecordingToDelete] = React.useState<RecordedMeeting | null>(null);
  const [isPermanentDeleteChecked, setIsPermanentDeleteChecked] = React.useState(false);

  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlayerModalOpen) return;

    const updatePlayState = () => setIsPlaying(!video.paused);
    const updateVolumeState = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      if (video.duration > 0) {
        setCurrentTime(video.currentTime);
      }
    };
    const handleVideoEnded = () => setIsPlaying(false);

    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);
    video.addEventListener('volumechange', updateVolumeState);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleVideoEnded);
    
    updatePlayState();
    updateVolumeState();
    if (video.readyState >= video.HAVE_METADATA) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
      video.removeEventListener('volumechange', updateVolumeState);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [isPlayerModalOpen, currentVideoUrl]);

  const handleOpenPlayerModal = (open: boolean) => {
    if (!open && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
    setIsPlayerModalOpen(open);
  };

  const handlePlayVideo = (recording: RecordedMeeting) => {
    if (recording.videoUrl) {
      setCurrentVideoUrl(recording.videoUrl);
      setCurrentVideoTitle(recording.title);
      setIsPlaying(false);
      setCurrentTime(0);
      setVideoDuration(0);
      handleOpenPlayerModal(true); 
    } else {
      toast({ title: "Video Not Available", description: `No video URL found for recording: ${recording.title}`, variant: "destructive" });
    }
  };

  const handlePlayPauseToggle = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play().catch(err => console.error("Error playing video:", err));
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      if (videoRef.current.muted && clampedVolume > 0) {
        videoRef.current.muted = false;
      }
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && videoDuration > 0) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressBarHover = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoDuration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const hoverRatio = Math.min(1, Math.max(0, x / width));
      setTooltipTime(hoverRatio * videoDuration);
      setIsProgressBarHovered(true);
    }
  };

  const handleProgressBarLeave = () => {
    setIsProgressBarHovered(false);
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoDuration > 0 && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      const clickRatio = Math.min(1, Math.max(0, x / width));
      const newTime = clickRatio * videoDuration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleStartTranscription = (recordingId: string) => {
    setRecordings(prev => 
      prev.map(rec => rec.id === recordingId ? { ...rec, recordingStatus: 'Transcription Pending' } : rec)
    );
    toast({ title: "Transcription Started", description: `Transcription process initiated for recording: ${recordingId}` });
    
    setTimeout(() => {
      setRecordings(prev => 
        prev.map(rec => {
          if (rec.id === recordingId) {
            const success = Math.random() > 0.3;
            return { ...rec, recordingStatus: success ? 'Transcribed' : 'Transcription Failed' };
          }
          return rec;
        })
      );
      toast({ title: "Transcription Update", description: `Transcription status updated for recording: ${recordingId}` });
    }, 3000);
  };
  
  const handleDeleteRecordingClick = (recording: RecordedMeeting) => {
    setRecordingToDelete(recording);
    setIsPermanentDeleteChecked(false);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteRecording = () => {
    if (!recordingToDelete) return;

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

  const handleUndoDelete = (recordingId: string) => {
    setRecordings(prev => 
      prev.map(rec => 
        rec.id === recordingId 
        ? { ...rec, recordingStatus: rec.previousStatus || 'Recorded' } // Restore to previous or default 'Recorded'
        : rec
      )
    );
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
            return format(parseISO(dateString), 'MM/dd/yyyy');
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
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => handlePlayVideo(recording)}
                disabled={!recording.videoUrl && recording.recordingStatus !== 'Transcription Pending'}
              >
                <PlayCircle className="mr-1 h-4 w-4" />
                Play
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(recording.recordingStatus === 'Recorded' || recording.recordingStatus === 'Transcription Failed') && (
                    <DropdownMenuItem onClick={() => handleStartTranscription(recording.id)}>
                      <FileText className="mr-2 h-4 w-4" /> 
                      {recording.recordingStatus === 'Transcription Failed' ? 'Retry Transcription' : 'Start Transcription'}
                    </DropdownMenuItem>
                  )}
                  {recording.recordingStatus === 'Transcribed' && (
                     <DropdownMenuItem onClick={() => toast({ title: "View Transcription", description: "Navigating to transcription details (simulated)." })}>
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
    [] 
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
          <DataTable columns={columns} data={filteredRecordings} initialPageSize={5} />
        </CardContent>
      </Card>

      <Dialog open={isPlayerModalOpen} onOpenChange={handleOpenPlayerModal}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center">
              <PlayCircle className="mr-2 h-6 w-6 text-primary" />
              Playing: {currentVideoTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-muted/30">
            {currentVideoUrl ? (
              <video
                ref={videoRef}
                src={currentVideoUrl}
                className="w-full aspect-video rounded-md shadow-md bg-black cursor-pointer"
                onClick={handlePlayPauseToggle}
                onLoadedMetadata={() => { 
                    if(videoRef.current) {
                        setVolume(videoRef.current.volume);
                        setIsMuted(videoRef.current.muted);
                        setVideoDuration(videoRef.current.duration);
                    }
                }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-muted-foreground text-center py-10">No video to display.</p>
            )}
            {currentVideoUrl && (
              <>
                <div className="flex items-center gap-2 px-1 mt-2 w-full">
                  <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip open={isProgressBarHovered && tooltipTime !== null && videoDuration > 0}>
                      <TooltipTrigger asChild>
                        <div
                          ref={progressBarRef}
                          className="relative flex-grow h-6 flex items-center cursor-pointer group"
                          onMouseMove={handleProgressBarHover}
                          onMouseLeave={handleProgressBarLeave}
                          onClick={handleProgressBarClick}
                        >
                          <Slider
                            value={videoDuration > 0 ? [currentTime] : [0]}
                            max={videoDuration > 0 ? videoDuration : 1}
                            step={0.1}
                            onValueChange={handleSeek}
                            className={cn(
                              "w-full absolute top-1/2 -translate-y-1/2",
                              "[&>span:first-of-type]:h-2", 
                              "[&>button]:h-4 [&>button]:w-4 [&>button]:border-2" 
                            )}
                            aria-label="Video progress"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="bg-black/80 text-white py-1 px-2 rounded text-xs">
                        <p>{tooltipTime !== null ? formatTime(tooltipTime) : '00:00'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs font-mono text-muted-foreground w-12 text-center tabular-nums">
                    {formatTime(videoDuration)}
                  </span>
                </div>

                <div className="mt-3 p-3 bg-background/70 rounded-md shadow flex items-center justify-between space-x-2">
                  <Button variant="ghost" size="icon" onClick={handlePlayPauseToggle} aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  
                  <div className="flex items-center space-x-1 flex-grow justify-center">
                    <Button variant="ghost" size="icon" onClick={handleToggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                      {isMuted ? <VolumeX className="h-5 w-5" /> : (volume > 0.5 ? <Volume2 className="h-5 w-5" /> : <Volume1 className="h-5 w-5" />) }
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
                      className="w-24 h-2 bg-muted-foreground rounded-lg appearance-none cursor-pointer accent-primary mx-2"
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

