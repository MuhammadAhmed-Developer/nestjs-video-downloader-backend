import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { VideoService } from './video.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly videoService: VideoService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('video/info')
  async getVideoInfo(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('Video URL is required');
    }
    return this.videoService.getInfo(url);
  }

  @Get('video/download')
  async downloadVideo(
    @Query('url') url: string,
    @Res() res: Response,
    @Query('formatId') formatId?: string,
  ) {
    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    try {
      const yt = this.videoService.streamVideo(url, formatId);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);

      yt.stdout.pipe(res);

      yt.stderr.on('data', (data) => {
        console.error(`yt-dlp error: ${data}`);
      });

      yt.on('error', (err) => {
        if (!res.headersSent) {
          res
            .status(500)
            .json({ error: 'Failed to start yt-dlp', details: err.message });
        }
      });

      yt.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
          res.status(500).json({ error: `yt-dlp exited with code ${code}` });
        }
      });
    } catch (err: any) {
      return res
        .status(500)
        .json({ error: 'Internal server error', details: err.message });
    }
  }

  // Legacy endpoint for backward compatibility (optional, but good for migration)
  @Post('video-download')
  async videoDownload(@Body('url') url: string, @Res() res: Response) {
    return this.downloadVideo(url, res, undefined);
  }
}
