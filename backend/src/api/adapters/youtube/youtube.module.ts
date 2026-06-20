import { Module } from '@nestjs/common';
import { YouTubeHttpService } from './youtube.http.service';
import { YouTubeAdapterService } from './youtube.adapter.service';

@Module({
    providers: [YouTubeHttpService, YouTubeAdapterService],
    exports: [YouTubeAdapterService],
})
export class YouTubeModule {}
