"""Verify video byte-range responses using synthetic media in an isolated folder."""
from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from serve import PreviewHandler

class QuietHandler(PreviewHandler):
 def log_message(self,*args):pass

with TemporaryDirectory() as folder:
 data=bytes(range(256))*8
 Path(folder,'clip.mp4').write_bytes(data)
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=folder))
 thread=Thread(target=server.serve_forever,daemon=True);thread.start()
 try:
  def request(method='GET',byte_range=None):
   connection=HTTPConnection(*server.server_address,timeout=5)
   connection.request(method,'/clip.mp4',headers={'Range':byte_range} if byte_range else {})
   response=connection.getresponse();result=(response.status,dict(response.getheaders()),response.read());connection.close();return result
  status,headers,body=request();assert status==200 and body==data and headers['Accept-Ranges']=='bytes'
  for requested,start,end in [('bytes=0-31',0,31),('bytes=100-',100,2047),('bytes=-64',1984,2047),('bytes=2000-9999',2000,2047)]:
   status,headers,body=request(byte_range=requested)
   assert status==206 and body==data[start:end+1]
   assert headers['Content-Range']==f'bytes {start}-{end}/{len(data)}'
   assert int(headers['Content-Length'])==end-start+1
  for invalid in ['bytes=9999-','bytes=20-10','bytes=-0','bytes=a-b','bytes=-']:
   status,headers,body=request(byte_range=invalid);assert status==416 and not body and headers['Content-Range']=='bytes */2048'
  status,headers,body=request('HEAD','bytes=0-31');assert status==206 and not body and headers['Content-Length']=='32'
 finally:
  server.shutdown();server.server_close();thread.join()
print('Video preview server: complete, partial, suffix, open-ended, invalid ranges and HEAD PASS')
