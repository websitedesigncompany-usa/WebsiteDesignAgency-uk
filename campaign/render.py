"""Render the square campaign. Requires pillow, numpy, imageio-ffmpeg."""
from pathlib import Path
import subprocess, wave, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
P=Path(__file__).resolve().parent
W=1080; FPS=24
ff=imageio_ffmpeg.get_ffmpeg_exe()
work=P/'.work'; work.mkdir(exist_ok=True)
navy='#07162b'; lime='#c5ff45'; white='#f7fafc'; muted='#a9bacb'
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def text(d,xy,s,size=32,fill=white,b=False): d.text(xy,s,font=ImageFont.truetype(bold if b else font,size),fill=fill)
poster=Image.open(P/'campaign-image.png').convert('RGB').resize((W,W),Image.Resampling.LANCZOS)
hero=poster.crop((90,415,990,860)).resize((920,455),Image.Resampling.LANCZOS)
durations=[]
for i in range(1,5):
 with wave.open(str(P/f'voice-{i}.wav')) as a: duration=a.getnframes()/a.getframerate()+0.8
 durations.append(math.ceil(duration*FPS)/FPS)
 subprocess.run([ff,'-y','-i',str(P/f'voice-{i}.wav'),'-af','apad','-t',str(durations[-1]),'-ar','48000','-ac','2',str(work/f'a{i}.wav')],check=True,stderr=subprocess.DEVNULL)
(work/'audio.txt').write_text(''.join(f"file '{work/f'a{i}.wav'}'\n" for i in range(1,5)))
subprocess.run([ff,'-y','-f','concat','-safe','0','-i',str(work/'audio.txt'),'-af','loudnorm=I=-16:TP=-1.5:LRA=11',str(work/'narration.wav')],check=True,stderr=subprocess.DEVNULL)
scenes=[('YOUR NEXT CUSTOMER STARTS HERE',['Turn More Clicks','Into Customers'],[]),('MAKE EVERY VISIT COUNT',['Clicks are just','the beginning.'],['Make your offer clear.','Give visitors a next step.']),('DESIGNED AROUND YOUR CUSTOMERS',['Clear message.','Modern design.'],['Make a confident first impression.']),('EVERY SCREEN. ONE EXPERIENCE.',['Look great.','Wherever they land.'],['Mobile  /  Tablet  /  Desktop']),('FROM INTEREST TO ACTION',['Make the next','step feel easy.'],['Explore your services.','Understand your value.','Take action.']),('THE RIGHT WEBSITE FOR YOUR BUSINESS',['A fresh start.','A smarter website.'],['Landing pages','Online stores','Website redesigns']),('LET’S TALK ABOUT YOUR PROJECT',['Your next chapter','starts here.'],['Get a free quote.','websitedesign.group']),('WEBSITE DESIGN AGENCY',['Turn More Clicks','Into Customers'],[])]
lens=[x/2 for x in durations for _ in range(2)]
total=sum(lens)
proc=subprocess.Popen([ff,'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1080x1080','-r',str(FPS),'-i','-','-i',str(work/'narration.wav'),'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','192k','-movflags','+faststart','-t',str(total),str(P/'campaign-video.mp4')],stdin=subprocess.PIPE,stderr=open(work/'encode.log','w'))
for n in range(round(total*FPS)):
 t=n/FPS; start=0
 for idx,length in enumerate(lens):
  if t < start+length: break
  start+=length
 u=t-start; progress=min(1,u/0.7); ease=1-(1-progress)**3
 if idx in (0,7):
  scale=1+0.022*u/length; size=int(W*scale)
  im=poster.resize((size,size),Image.Resampling.BICUBIC); off=(size-W)//2; im=im.crop((off,off,off+W,off+W))
 else:
  im=Image.new('RGB',(W,W),navy); d=ImageDraw.Draw(im)
  for x in range(60,1080,120): d.line((x,0,x,1080),fill='#11243a',width=1)
  for y in range(0,1080,120): d.line((0,y,1080,y),fill='#11243a',width=1)
  d.rounded_rectangle((65,58,109,102),radius=12,fill=lime);text(d,(76,65),'W',23,navy,True)
  text(d,(128,64),'Website Design Agency',29,b=True)
  text(d,(65,155),scenes[idx][0],21,lime,True)
  y=int(215+28*(1-ease))
  for line in scenes[idx][1]: text(d,(60,y),line,65,b=True); y+=82
  if idx==1:
   im.paste(hero,(80,430));d=ImageDraw.Draw(im)
   text(d,(65,889),'Make your offer clear. Give visitors a next step.',28)
  elif idx==3:
   # Responsive browser and mobile interface, intentionally illustrative.
   d.rounded_rectangle((85,475,805,820),radius=22,fill='#20354e',outline='#526783',width=2)
   for x in (111,132,153):d.ellipse((x,492,x+9,501),fill=lime)
   d.rounded_rectangle((112,530,777,793),radius=12,fill='#0d2038')
   text(d,(145,561),'Built for every screen.',35,b=True)
   d.rounded_rectangle((146,639,413,655),radius=8,fill='#526783')
   d.rounded_rectangle((146,680,349,734),radius=12,fill=lime)
   text(d,(175,694),'Explore',22,navy,True)
   d.rounded_rectangle((741,553,970,871),radius=30,fill='#36516c',outline=white,width=3)
   d.rounded_rectangle((758,578,953,849),radius=20,fill='#0d2038')
   for yy in (616,649,682):d.rounded_rectangle((780,yy,925,yy+12),radius=5,fill='#526783')
   d.rounded_rectangle((780,738,925,791),radius=10,fill=lime)
   text(d,(204,902),scenes[idx][2][0],31)
  else:
   items=scenes[idx][2]
   for j,item in enumerate(items):
    yy=470+j*135+int(18*(1-ease)); d.rounded_rectangle((65,yy,1015,yy+108),radius=22,fill='#132b43',outline='#2c465e',width=2)
    d.ellipse((90,yy+29,139,yy+78),fill=lime)
    text(d,(105,yy+35),str(j+1),26,navy,True)
    text(d,(168,yy+33),item,36,b=True)
   if idx in (2,6):
    text(d,(65,800),'CUSTOM WEBSITES. CLEARER JOURNEYS.',23,lime,True)
  d.line((65,982,1015,982),fill='#30465c',width=2)
  text(d,(65,1005),'websitedesign.group',25)
  text(d,(790,1005),'Get a free quote →',22,lime)
 # Brief fade between art-directed scenes, plus continuous campaign progress.
 fade=min(1,u/0.22,(length-u)/0.22)
 if fade<1: im=Image.blend(Image.new('RGB',(W,W),navy),im,max(0,fade))
 d=ImageDraw.Draw(im);d.rectangle((0,1074,int(W*t/total),1080),fill=lime)
 proc.stdin.write(im.tobytes())
proc.stdin.close()
if proc.wait(): raise RuntimeError('Encoding failed; see .work/encode.log')
print(f'Rendered {total:.2f}s, 1080x1080, {FPS} fps')
