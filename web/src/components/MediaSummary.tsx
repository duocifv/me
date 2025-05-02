import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive,
  Image as ImageIcon,
  FileText,
  Music,
  Video,
} from "lucide-react";

const storageStats = [
  { label: "Total", used: 94, limit: 100, icon: HardDrive },
  { label: "Images", used: 26, limit: 100, icon: ImageIcon },
  { label: "Documents", used: 38, limit: 100, icon: FileText },
  { label: "Audios", used: 54, limit: 100, icon: Music },
  { label: "Videos", used: 67, limit: 100, icon: Video },
];

export function MediaSummary() {
  return (
    <div className="relative px-4 mr-2">
      <Carousel>
        <CarouselContent className="flex -ml-4">
          {storageStats.map(({ label, used, limit, icon: Icon }) => {
            const percent = Math.round((used / limit) * 100);
            return (
              <CarouselItem
                key={label}
                className="pl-4 md:pl-6 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
              >
                <Card className="border rounded-lg shadow-sm">
                  <CardHeader className="flex items-center">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {label} Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold mb-2">
                      {used} / {limit} GB
                    </p>
                    <Progress value={percent} className="h-2 rounded-full" />
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow">
          ‹
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow">
          ›
        </CarouselNext>
      </Carousel>
    </div>
  );
}
