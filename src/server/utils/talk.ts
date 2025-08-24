import fs from 'fs'
import { join } from 'path'
import pkg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe' 

const ffmpeg = pkg
ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

const format : any = {
  'ca1': 'ca-1-tieng',
  'ca1.5': 'ca-1-tieng-ruoi',
  'ca2': 'ca-2-tieng',
  'ca2.5': 'ca-2-tieng-ruoi',
  'ca3': 'ca-3-tieng',
  'ca3.5': 'ca-3-tieng-ruoi',
  'ca4': 'ca-4-tieng',
  'ca4.5': 'ca-4-tieng-ruoi',
  'ca5': 'ca-5-tieng',
  'ca5.5': 'ca-5-tieng-ruoi',
  'ca6': 'ca-6-tieng',
  'ca6.5': 'ca-6-tieng-ruoi',
  'ca7': 'ca-7-tieng',
  'ca7.5': 'ca-7-tieng-ruoi',
  'ca8': 'ca-8-tieng',
  'ca8.5': 'ca-8-tieng-ruoi',
  'ca9': 'ca-9-tieng',
  'ca9.5': 'ca-9-tieng-ruoi',
  'ca10': 'ca-10-tieng',
  'ca10.5': 'ca-10-tieng-ruoi',
  'ca11': 'ca-11-tieng',
  'ca11.5': 'ca-11-tieng-ruoi',
  'ca12': 'ca-12-tieng',
  'ca12.5': 'ca-12-tieng-ruoi',
  'ca13': 'ca-13-tieng',
  'ca13.5': 'ca-13-tieng-ruoi',
  'ca14': 'ca-14-tieng',
  'ca14.5': 'ca-14-tieng-ruoi',
  'ca15': 'ca-15-tieng',
  'ca15.5': 'ca-15-tieng-ruoi',
  'ca16': 'ca-16-tieng',
  'ca16.5': 'ca-16-tieng-ruoi',
  'ca17': 'ca-17-tieng',
  'ca17.5': 'ca-17-tieng-ruoi',
  'ca18': 'ca-18-tieng',
  'ca18.5': 'ca-18-tieng-ruoi',
  'ca19': 'ca-19-tieng',
  'ca19.5': 'ca-19-tieng-ruoi',
  'ca20': 'ca-20-tieng',
  'ca20.5': 'ca-20-tieng-ruoi',
  'ca21': 'ca-21-tieng',
  'ca21.5': 'ca-21-tieng-ruoi',
  'ca22': 'ca-22-tieng',
  'ca22.5': 'ca-22-tieng-ruoi',
  'ca23': 'ca-23-tieng',
  'ca23.5': 'ca-23-tieng-ruoi',
  'ca24': 'ca-24-tieng',
}

const mergeAudio = async (strArray: string[]): Promise<string | null> => {
  return new Promise((resolve) => {
    const inputFiles = strArray.map(str => join(process.cwd(), 'assets/audio', `${format[str] ? format[str] : formatVNString(str, '-')}.mp3`))
    const outputName = `merged_${Date.now()}.mp3`
    const outputDir = join(process.cwd(), 'assets/audio/output')
    const outputFile = join(outputDir, outputName)

    let command = ffmpeg()

    inputFiles.forEach(file => {
      if (fs.existsSync(file)) {
        command = command.input(file)
      } 
      else {
        resolve(null)
      }
    })

    command
    .complexFilter([{
      filter: 'concat',
      options: { n: inputFiles.length, v: 0, a: 1 }
    }])
    .on('error', () => resolve(null))
    .on('end', () => {
      const buffer = fs.readFileSync(outputFile)
      const base64 = buffer.toString('base64')
      resolve(base64)
      fs.unlinkSync(outputFile)
    })
    .save(outputFile)
  })
}

export default async (strArray: string[]) => {
  const audio = await mergeAudio(strArray)
  if(!!audio) return !!IO && IO.emit('bot-talk', audio)
}