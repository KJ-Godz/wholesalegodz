#!/usr/bin/env python3
"""Serve only this project's dist, with no stale development-page caching."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from functools import partial
from pathlib import Path
class PreviewHandler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-store, max-age=0')
  self.send_header('X-Wholesale-Gods-Revision','05-gsap-hero')
  super().end_headers()
if __name__=='__main__':
 directory=str(Path(__file__).resolve().parents[1]/'dist')
 print('Wholesale Gods GSAP hero revision 05: http://127.0.0.1:4173 — '+directory,flush=True)
 ThreadingHTTPServer(('127.0.0.1',4173),partial(PreviewHandler,directory=directory)).serve_forever()
