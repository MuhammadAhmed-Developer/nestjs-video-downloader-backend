import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class VideoService {
  private readonly ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp.exe');

  async getInfo(url: string) {
    return new Promise((resolve, reject) => {
      const absolutePath = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
      console.log(`Executing getInfo for: ${url}`);
      
      const yt = spawn(absolutePath, ['-j', '--no-config', '--no-check-certificates', url]);
      let stdout = '';
      let stderr = '';

      yt.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      yt.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      yt.on('close', (code) => {
        if (code !== 0) {
          console.error(`yt-dlp failed with code ${code}`);
          console.error(`stderr: ${stderr}`);
          return reject(new InternalServerErrorException(`yt-dlp failed: ${stderr}`));
        }
        console.log(`yt-dlp raw output: ${stdout.substring(0, 500)}...`);
        try {
          const info = JSON.parse(stdout);
          resolve({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats: info.formats
              .filter((f: any) => f.vcodec !== 'none' && f.ext === 'mp4')
              .map((f: any) => ({
                format_id: f.format_id,
                resolution: f.resolution,
                filesize: f.filesize,
                ext: f.ext,
                quality: f.format_note || f.resolution,
              }))
              .reverse(),
            original_url: url,
          });
        } catch (e) {
          console.error(`Failed to parse yt-dlp output: ${e.message}`);
          reject(new InternalServerErrorException('Failed to parse video info'));
        }
      });
    });
  }

  streamVideo(url: string, formatId?: string) {
    const args = ['-f', formatId || 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '-o', '-', url];
    return spawn(this.ytDlpPath, args);
  }
}
