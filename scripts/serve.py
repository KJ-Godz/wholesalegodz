#!/usr/bin/env python3
"""Serve this project's dist, including byte ranges for native video playback."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
import os
import re

class PreviewHandler(SimpleHTTPRequestHandler):
 protocol_version='HTTP/1.1'

 def end_headers(self):
  self.send_header('Cache-Control','no-store, max-age=0')
  self.send_header('X-Wholesale-Gods-Revision','10-november-arrivals')
  self.send_header('Accept-Ranges','bytes')
  super().end_headers()

 def send_head(self):
  self._remaining=None
  path=Path(self.translate_path(self.path))
  requested=self.headers.get('Range')
  if not requested or self.headers.get('If-Range') or not path.is_file():
   return super().send_head()
  match=re.fullmatch(r'bytes=(\d*)-(\d*)',requested.strip())
  # Multiple ranges may be ignored; browsers need ordinary single byte ranges.
  if ',' in requested:return super().send_head()
  try:source=path.open('rb')
  except OSError:return super().send_head()
  info=os.fstat(source.fileno());size=info.st_size
  valid=bool(match and any(match.groups()) and size)
  if valid:
   first,last=match.groups()
   if first:start=int(first);end=min(int(last),size-1) if last else size-1
   else:start=max(0,size-int(last));end=size-1
   valid=0<=start<=end<size
  if not valid:
   source.close();self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.send_header('Content-Length','0');self.end_headers();return None
  source.seek(start);self._remaining=end-start+1
  self.send_response(206)
  self.send_header('Content-Type',self.guess_type(str(path)))
  self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.send_header('Content-Length',str(self._remaining))
  self.send_header('Last-Modified',self.date_time_string(info.st_mtime))
  self.end_headers();return source

 def copyfile(self,source,outputfile):
  if self._remaining is None:return super().copyfile(source,outputfile)
  remaining=self._remaining
  while remaining:
   data=source.read(min(64*1024,remaining))
   if not data:break
   outputfile.write(data);remaining-=len(data)

if __name__=='__main__':
 directory=str(Path(__file__).resolve().parents[1]/'dist')
 print('Wholesale Gods revision 09: http://127.0.0.1:4173 — '+directory,flush=True)
 ThreadingHTTPServer(('127.0.0.1',4173),partial(PreviewHandler,directory=directory)).serve_forever()
