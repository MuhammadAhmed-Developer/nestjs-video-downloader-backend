import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoService } from './video.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, VideoService],
})
export class AppModule {}
